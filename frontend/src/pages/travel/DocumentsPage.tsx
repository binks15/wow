import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Header } from "../../components/Header";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { useEmployeeSearch } from "../../hooks/useEmployeeSearch";
import { useTeamMembers } from "../../hooks/travel/useManager";
import {
  useDeleteTravelDocument,
  useUpdateTravelDocument,
  useUploadTravelDocument,
} from "../../hooks/travel/useTravelDocumentMutations";
import {
  useAssignedTravels,
  useCreatedTravels,
  useTravelAssignees,
} from "../../hooks/travel/useTravel";
import {
  useTravelDocuments,
  type TravelDocumentFilters,
} from "../../hooks/travel/useTravelDocuments";
import type { TravelDocument } from "../../types/document";
import type { DocumentFormValues } from "../../types/travel-document-forms";
import {
  TravelDocumentList,
  type TravelDocumentEdits,
} from "../../components/travel/TravelDocumentList";
import { TravelDocumentUploadForm } from "../../components/travel/TravelDocumentUploadForm";
import { TravelDocumentFiltersPanel } from "../../components/travel/TravelDocumentFiltersPanel";

const allowedDocumentFileMessage = "Only PDF and JPG/JPEG files are allowed.";

const isAllowedDocumentFile = (file: File) => {
  const fileType = file.type.toLowerCase();
  const extension = file.name.toLowerCase().split(".").pop() ?? "";

  return (
    fileType === "application/pdf" ||
    fileType === "image/jpeg" ||
    extension === "pdf" ||
    extension === "jpg" ||
    extension === "jpeg"
  );
};

export const DocumentsPage = () => {
  const queryClient = useQueryClient();
  const { role, userId } = useAuth();
  const canUpload = role === "HR" || role === "Employee";
  const isHr = role === "HR";
  const isManager = role === "Manager";
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const [editDocs, setEditDocs] = useState<TravelDocumentEdits>({});
  const employeesQuery = useEmployeeSearch(
    searchQuery,
    isHr && searchQuery.length >= 2,
  );
  const teamMembersQuery = isManager
    ? useTeamMembers()
    : { isLoading: false, data: [] };
  const filterForm = useForm<TravelDocumentFilters>({
    defaultValues: {
      travelId: undefined,
      employeeId: undefined,
    },
  });

  const uploadForm = useForm<DocumentFormValues>({
    defaultValues: {
      travelId: undefined,
      employeeId: undefined,
      documentType: "",
    },
  });

  const filters = filterForm.watch();
  const selectedEmployeeId = filters.employeeId
    ? Number(filters.employeeId)
    : undefined;
  const canFetchTravels = role === "Employee" || Boolean(selectedEmployeeId);
  const travelOptionsQuery = useAssignedTravels(
    selectedEmployeeId,
    canFetchTravels,
  );
  const createdTravelsQuery = useCreatedTravels(isHr);
  const normalizedFilters = {
    travelId: filters.travelId ? Number(filters.travelId) : undefined,
    employeeId: filters.employeeId ? Number(filters.employeeId) : undefined,
  };

  const { data, isLoading, isError, refetch } =
    useTravelDocuments(normalizedFilters);
  const uploadMutation = useUploadTravelDocument();
  const updateMutation = useUpdateTravelDocument();
  const deleteMutation = useDeleteTravelDocument();

  const employeeOptions = isHr
    ? (employeesQuery.data ?? [])
    : isManager
      ? (teamMembersQuery.data ?? []).map((member: any) => ({
          id: member.id,
          fullName: member.fullName,
          email: member.email,
        }))
      : [];

  const listLoading = isHr
    ? employeesQuery.isLoading
    : teamMembersQuery.isLoading;

  const uploadTravelId = uploadForm.watch("travelId")
    ? Number(uploadForm.watch("travelId"))
    : undefined;
  const uploadEmployeeId = uploadForm.watch("employeeId")
    ? Number(uploadForm.watch("employeeId"))
    : undefined;
  const resolvedUploadEmployeeId = isHr ? uploadEmployeeId : userId;
  const canLoadUploadTravels = Boolean(resolvedUploadEmployeeId);
  const uploadTravelsQuery = useAssignedTravels(
    resolvedUploadEmployeeId,
    canLoadUploadTravels,
  );
  const uploadAssigneesQuery = useTravelAssignees(
    uploadTravelId,
    isHr && Boolean(uploadTravelId),
  );

  const uploadEmployeeOptions = isHr
    ? (uploadAssigneesQuery.data ?? [])
    : employeeOptions;

  useEffect(() => {
    const travelParam = searchParams.get("travelId");
    const employeeParam = searchParams.get("employeeId");

    if (travelParam) {
      filterForm.setValue("travelId", Number(travelParam));
    }

    if (employeeParam) {
      filterForm.setValue("employeeId", Number(employeeParam));
    }
  }, [filterForm, searchParams]);

  const onUpload = async (values: DocumentFormValues) => {
    setMessage("");
    if (!values.travelId || Number(values.travelId) <= 0) {
      setMessage("Please select a valid travel.");
      return;
    }

    if (!values.documentType?.trim()) {
      setMessage("Document type is required.");
      return;
    }

    const file = values.file?.item(0);
    if (!file) {
      setMessage("File is required.");
      return;
    }

    await uploadMutation.mutateAsync({
      travelId: Number(values.travelId),
      employeeId: values.employeeId ? Number(values.employeeId) : undefined,
      documentType: values.documentType,
      file,
    });

    uploadForm.reset();
    await queryClient.invalidateQueries({ queryKey: ["travel-documents"] });
    await refetch();
    setMessage("Document uploaded successfully.");
  };

  const handleStartEdit = (doc: TravelDocument) => {
    setEditDocs((prev) => ({
      ...prev,
      [doc.documentId]: {
        documentType: doc.documentType ?? "",
        file: null,
      },
    }));
  };

  const handleCancelEdit = (documentId: number) => {
    setEditDocs((prev) => {
      const next = { ...prev };
      delete next[documentId];
      return next;
    });
  };

  const handleEditChange = (
    documentId: number,
    field: "documentType" | "file",
    value: string | File | null,
  ) => {
    if (field === "file" && value instanceof File && !isAllowedDocumentFile(value)) {
      setMessage(allowedDocumentFileMessage);
      return;
    }

    setEditDocs((prev) => ({
      ...prev,
      [documentId]: {
        documentType:
          field === "documentType"
            ? String(value)
            : (prev[documentId]?.documentType ?? ""),
        file:
          field === "file"
            ? (value as File | null)
            : (prev[documentId]?.file ?? null),
      },
    }));
  };

  const handleSaveEdit = async (documentId: number) => {
    const payload = editDocs[documentId];
    if (!payload) {
      return;
    }

    await updateMutation.mutateAsync({
      documentId,
      documentType: payload.documentType || undefined,
      file: payload.file ?? undefined,
    });

    setEditDocs((prev) => {
      const next = { ...prev };
      delete next[documentId];
      return next;
    });
    await queryClient.invalidateQueries({ queryKey: ["travel-documents"] });
    await refetch();
  };

  const handleDeleteDoc = async (documentId: number) => {
    if (!globalThis.confirm("Delete this document?")) return;
    await deleteMutation.mutateAsync(documentId);
    await queryClient.invalidateQueries({ queryKey: ["travel-documents"] });
    await refetch();
  };

  return (
    <section className="space-y-6">
      <Header
        title="Travel documents"
        description="Browse uploaded travel documents and filter by travel or employee."
      />

      {canUpload ? (
        <TravelDocumentUploadForm
          form={uploadForm}
          onSubmit={onUpload}
          isHr={isHr}
          employeeOptions={uploadEmployeeOptions}
          onSearch={setSearchQuery}
          isLoadingOptions={listLoading}
          hrTravels={createdTravelsQuery.data}
          isLoadingHrTravels={createdTravelsQuery.isLoading}
          uploadTravels={uploadTravelsQuery.data}
          isLoadingTravels={uploadTravelsQuery.isLoading}
          resolvedEmployeeId={resolvedUploadEmployeeId}
          isUploading={uploadMutation.isPending}
          message={message}
        />
      ) : null}

      <TravelDocumentFiltersPanel
        control={filterForm.control}
        employeeOptions={employeeOptions}
        onSearch={setSearchQuery}
        showEmployeeSearch={role !== "Employee"}
        isLoadingOptions={listLoading}
        travelOptions={travelOptionsQuery.data}
        selectedTravelId={
          filters.travelId ? Number(filters.travelId) : undefined
        }
        onEmployeeChange={() => filterForm.setValue("travelId", undefined)}
        onTravelChange={(value) => filterForm.setValue("travelId", value)}
      />
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading documents...
        </div>
      ) : null}

      {isError ? (
        <Card>
          <p className="text-sm text-red-600">
            Unable to load documents right now.
          </p>
        </Card>
      ) : null}

      {data?.length ? (
        <TravelDocumentList
          documents={data}
          editDocs={editDocs}
          userId={userId}
          onEditChange={handleEditChange}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={handleDeleteDoc}
          isSaving={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      ) : null}

      {!isLoading && !isError && !data?.length ? (
        <EmptyState
          title="No documents yet"
          description="Upload travel documents to see them listed here."
        />
      ) : null}
    </section>
  );
};