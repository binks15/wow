import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { toDateInputValue } from "../../utils/format";
import { Spinner } from "../../components/ui/Spinner";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { useEmployeeSearch } from "../../hooks/useEmployeeSearch";
import { useTeamMembers } from "../../hooks/travel/useManager";
import {
  useAssignedTravels,
  useCreatedTravels,
  useTravelById,
} from "../../hooks/travel/useTravel";
import {
  useCreateTravel,
  useDeleteTravel,
  useUpdateTravel,
} from "../../hooks/travel/useTravelMutations";
import { TravelCreateForm } from "../../components/travel/TravelCreateForm";
import { TravelLookupPanel } from "../../components/travel/TravelLookupPanel";
import { TravelList } from "../../components/travel/TravelList";
import type {
  TravelCreateFormValues,
  TravelEditFormValues,
  TravelFilterValues,
} from "../../types/travel-forms";

export const TravelsPage = () => {
  const { role, userId } = useAuth();
  const isEmployee = role === "Employee";
  const isHr = role === "HR";
  const isManager = role === "Manager";
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTravelId, setEditingTravelId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const navigate = useNavigate();

  const { watch, control: controlFilter } = useForm<TravelFilterValues>({
    defaultValues: { employeeId: undefined },
  });

  const selectedEmployeeId = watch("employeeId");
  const normalizedEmployeeId = selectedEmployeeId
    ? Number(selectedEmployeeId)
    : undefined;
  const travelEmployeeId = isEmployee ? userId : normalizedEmployeeId;
  const canFetchAssigned = isEmployee ? Boolean(userId) : Boolean(normalizedEmployeeId);

  const assignedTravelsQuery = useAssignedTravels(
    travelEmployeeId,
    canFetchAssigned,
  );
  const createdTravelsQuery = useCreatedTravels(isHr);
  const travelDetailQuery = useTravelById(
    editingTravelId ?? undefined,
    Boolean(editingTravelId) && isHr,
  );
  const createTravel = useCreateTravel();
  const updateTravel = useUpdateTravel();
  const deleteTravel = useDeleteTravel();
  const employeesQuery = useEmployeeSearch(
    searchQuery,
    isHr && searchQuery.length >= 2,
  );
  const teamMembersQuery = isManager
    ? useTeamMembers()
    : { isLoading: false, data: [] };

  const listLoading = isHr
    ? employeesQuery.isLoading
    : teamMembersQuery.isLoading;

  const activeTravelsQuery = isHr && !normalizedEmployeeId
    ? createdTravelsQuery
    : assignedTravelsQuery;

  const travels = activeTravelsQuery.data ?? [];
  const isTravelsLoading = activeTravelsQuery.isLoading;
  const isTravelsError = activeTravelsQuery.isError;

  // const editTotalClaimedAmount = travelDetailQuery.data?.totalClaimedAmount ?? null;

  const createForm = useForm<TravelCreateFormValues>({
    defaultValues: {
      travelName: "",
      destination: "",
      purpose: "",
      startDate: "",
      endDate: "",
      assignments: [],
    },
  });

  const editForm = useForm<TravelEditFormValues>({
    defaultValues: {
      travelName: "",
      destination: "",
      purpose: "",
      startDate: "",
      endDate: "",
      assignments: [],
    },
  });

  const employeeOptions = isHr
    ? employeesQuery.data ?? []
    : isManager
      ? (teamMembersQuery.data ?? []).map((member:any) => ({
          id: member.id,
          fullName: member.fullName,
          email: member.email,
        }))
      : [];

  const onCreateTravel = async (values: TravelCreateFormValues) => {
    setMessage("");
    if (!userId) {
      setMessage("Unable to identify the current user.");
      return;
    }

    if (!values.assignments?.length) {
      setMessage("Enter at least one employee ID to assign.");
      return;
    }

    await createTravel.mutateAsync({
      travelName: values.travelName,
      destination: values.destination,
      purpose: values.purpose || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
      createdById: userId,
      assignments: values.assignments.map((employeeId) => ({ employeeId })),
    });

    createForm.reset();
    setMessage("Travel created successfully.");
  };

  const startEdit = (travelId: number) => {
    setEditMessage("");
    setEditingTravelId(travelId);
    editForm.reset({
      travelName: "",
      destination: "",
      purpose: "",
      startDate: "",
      endDate: "",
      assignments: [],
    });
  };

  useEffect(() => {
    if (!travelDetailQuery.data || editingTravelId === null) {
      return;
    }

    if (travelDetailQuery.data.travelId !== editingTravelId) {
      return;
    }

    editForm.setValue("travelName", travelDetailQuery.data.travelName);
    editForm.setValue("destination", travelDetailQuery.data.destination);
    editForm.setValue("purpose", travelDetailQuery.data.purpose ?? "");
    editForm.setValue(
      "startDate",
      toDateInputValue(travelDetailQuery.data.startDate),
    );
    editForm.setValue(
      "endDate",
      toDateInputValue(travelDetailQuery.data.endDate),
    );
    editForm.setValue(
      "assignments",
      travelDetailQuery.data.assignedEmployeeIds ?? [],
    );
  }, [editForm, editingTravelId, travelDetailQuery.data]);

  const onUpdateTravel = async (values: TravelEditFormValues) => {
    if (!editingTravelId) {
      return;
    }

    await updateTravel.mutateAsync({
      travelId: editingTravelId,
      travelName: values.travelName,
      destination: values.destination,
      purpose: values.purpose || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
      assignedEmployeeIds: values.assignments,
    });

    setEditingTravelId(null);
    editForm.reset();
    await activeTravelsQuery.refetch();
    setEditMessage("Travel updated successfully.");
  };

  const onDeleteTravel = async (travelId: number) => {
    if (!globalThis.confirm("Delete this travel plan?")) {
      return;
    }

    await deleteTravel.mutateAsync(travelId);
    await activeTravelsQuery.refetch();
  };

  const goToDocuments = (travelId: number) => {
    const params: Record<string, string> = { travelId: String(travelId) };
    if (!isEmployee && normalizedEmployeeId) {
      params.employeeId = String(normalizedEmployeeId);
    }
    navigate({
      pathname: "/documents",
      search: createSearchParams(params).toString(),
    });
  };

  return (
    <section className="space-y-6">
      <Header title="Travels" />

      {isHr ? (
        <TravelCreateForm
          form={createForm}
          onSubmit={onCreateTravel}
          employeeOptions={employeeOptions}
          onSearch={setSearchQuery}
          isLoadingOptions={listLoading}
          isSubmitting={createTravel.isPending}
          message={message}
        />
      ) : null}

      {!isEmployee ? (
        <TravelLookupPanel
          control={controlFilter}
          employeeOptions={employeeOptions}
          onSearch={setSearchQuery}
          isLoadingOptions={listLoading}
        />
      ) : null}

      {isTravelsLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading travels...
        </div>
      ) : null}

      {isTravelsError ? (
        <Card>
          <p className="text-sm text-red-600">
            Unable to load travels right now.
          </p>
        </Card>
      ) : null}

      {travels.length ? (
        <TravelList
          travels={travels}
          isHr={isHr}
          badgeLabel={isHr && !normalizedEmployeeId ? "Created" : "Assigned"}
          editingTravelId={editingTravelId}
          editForm={editForm}
          onEditStart={startEdit}
          onUpdate={onUpdateTravel}
          onDelete={onDeleteTravel}
          onCancelEdit={() => setEditingTravelId(null)}
          onViewDocuments={goToDocuments}
          isUpdating={updateTravel.isPending}
          employeeOptions={employeeOptions}
          onSearch={setSearchQuery}
          isLoadingOptions={listLoading}
        />
      ) : null}

      {!isTravelsLoading && !isTravelsError && !travels.length ? (
        <EmptyState
          title="No travel plans yet"
          description={
            isHr
              ? normalizedEmployeeId
                ? "Assigned travels will appear here once you create and assign a plan to this employee."
                : "Created travels will appear here once you add a travel plan."
              : canFetchAssigned
                ? "Assigned travels will appear here once HR creates and assigns a plan."
                : "Select an employee to view assigned travel plans."
          }
        />
      ) : null}
      {editMessage ? (
        <p className="text-sm text-emerald-600">{editMessage}</p>
      ) : null}
    </section>
  );
};