import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import {
  useUploadProfileAvatar,
  useUserProfile,
  useUpdateUserProfile,
} from "../hooks/useProfile";
import {
  useGameInterests,
  useUpdateGameInterests,
} from "../hooks/games/useGameInterests";
import { toDateInputValue } from "../utils/format";
import type { UserProfileUpdatePayload } from "../types/user-profile";
import GameIntrest from "../components/game/GameIntrest";

type ProfileFormValues = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  profilePhotoUrl: string;
  department: string;
  designation: string;
};

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const profileQuery = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadProfileAvatar();
  const gameInterests = useGameInterests();
  const updateGameInterests = useUpdateGameInterests();
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarMessage, setAvatarMessage] = useState("");
  const [interestMessage, setInterestMessage] = useState("");
  const [selectedGames, setSelectedGames] = useState<number[]>([]);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "",
      phone: "",
      dateOfBirth: "",
      profilePhotoUrl: "",
      department: "",
      designation: "",
    },
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    form.reset({
      fullName: profileQuery.data.fullName ?? "",
      phone: profileQuery.data.phone ?? "",
      dateOfBirth: toDateInputValue(profileQuery.data.dateOfBirth),
      profilePhotoUrl: profileQuery.data.profilePhotoUrl ?? "",
      department: profileQuery.data.department ?? "",
      designation: profileQuery.data.designation ?? "",
    });
  }, [form, profileQuery.data]);

  useEffect(() => {
    if (!gameInterests.data) {
      return;
    }

    setSelectedGames(
      gameInterests.data
        .filter((item: any) => item.isInterested)
        .map((item: any) => item.gameId),
    );
  }, [gameInterests.data]);

  const onSubmit = async (values: ProfileFormValues) => {
    setMessage("");

    const payload: UserProfileUpdatePayload = {
      fullName: values.fullName,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth || undefined,
      profilePhotoUrl: values.profilePhotoUrl || undefined,
      department: values.department || undefined,
      designation: values.designation || undefined,
    };

    const updated = await updateProfile.mutateAsync(payload);
    if (updated) {
      setMessage("Profile updated successfully.");
    }
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) {
      return;
    }

    setAvatarMessage("");
    const updated = await uploadAvatar.mutateAsync(avatarFile);
    if (updated) {
      form.setValue("profilePhotoUrl", updated.profilePhotoUrl ?? "");
      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setAvatarFile(null);
      setAvatarMessage("Avatar updated successfully.");
    }
  };

  const onSaveInterests = async () => {
    setInterestMessage("");
    await updateGameInterests.mutateAsync(selectedGames);
    setInterestMessage("Game interests updated.");
  };

  return (
    <section className="space-y-6">
      <Header
        title="Profile"
        description="Update your personal and work details."
      />

      {profileQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading profile...
        </div>
      ) : null}

      {profileQuery.isError ? (
        <Card>
          <p className="text-sm text-red-600">
            Unable to load profile right now.
          </p>
        </Card>
      ) : null}

      {profileQuery.data ? (
        <Card>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {profileQuery.data.profilePhotoUrl ? (
                <img
                  src={profileQuery.data.profilePhotoUrl}
                  alt="Profile avatar"
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs text-slate-400">
                  No photo
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Profile photo
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                label="Avatar"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setAvatarFile(event.target.files?.item(0) ?? null)
                }
              />
              <Button
                type="button"
                disabled={!avatarFile || uploadAvatar.isPending}
                onClick={onUploadAvatar}
              >
                {uploadAvatar.isPending ? "Uploading..." : "Upload avatar"}
              </Button>
            </div>
          </div>
          {avatarMessage ? (
            <p className="mb-4 text-sm text-emerald-600">{avatarMessage}</p>
          ) : null}
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Input
              label="Full name"
              error={form.formState.errors.fullName?.message}
              {...form.register("fullName", {
                required: "Full name is required.",
              })}
            />
            <Input label="Email" value={profileQuery.data.email} disabled />
            <Input label="Phone" {...form.register("phone")} />
            <Input
              label="Role"
              value={profileQuery.data.role ?? "—"}
              disabled
            />
            <Input
              label="Date of birth"
              type="date"
              {...form.register("dateOfBirth")}
            />
            <Input
              label="Date of joining"
              value={toDateInputValue(profileQuery.data.dateOfJoining)}
              disabled
            />
            <Input
              label="Manager"
              value={profileQuery.data.manager ?? "—"}
              disabled
            />
            <Input label="Department" {...form.register("department")} />
            <Input label="Designation" {...form.register("designation")} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
          {message ? (
            <p className="mt-3 text-sm text-emerald-600">{message}</p>
          ) : null}
        </Card>
      ) : null}
      <GameIntrest
        gameInterests={gameInterests}
        setSelectedGames={setSelectedGames}
        selectedGames={selectedGames}
        updateGameInterests={updateGameInterests}
        onSaveInterests={onSaveInterests}
        interestMessage={interestMessage}
      />
    </section>
  );
};
