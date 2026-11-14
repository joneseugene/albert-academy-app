"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ImageField, NumberField, SelectField, TextField } from "@/components/shared/form/fields";
import { FormActions, FormSection } from "@/components/shared/form/form-section";
import { RichTextField } from "@/components/shared/rich-text/rich-text-field";
import { ListField } from "@/components/shared/form/list-field";
import { RelativeTime } from "@/components/shared/relative-time";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useServerMutation } from "@/hooks/use-server-action";
import { usePermission } from "@/providers/session-provider";
import { updateSchoolInfoAction } from "../actions";
import {
  CONTACT_TYPES,
  SOCIAL_PLATFORMS,
  schoolInfoFormSchema,
  type ContactType,
  type SchoolInfo,
  type SchoolInfoFormOutput,
  type SchoolInfoFormValues,
  type SocialPlatform,
} from "../schemas";

const toOptions = (map: Record<string, string>) =>
  Object.entries(map).map(([value, label]) => ({ value, label }));

function toFormValues(info: SchoolInfo): SchoolInfoFormValues {
  return {
    name: info.name,
    motto: info.motto ?? "",
    foundedYear: info.foundedYear,
    logoUrl: info.logoUrl ?? "",
    vision: info.vision ?? "",
    mission: info.mission ?? "",
    about: info.about ?? "",
    history: info.history ?? "",
    coreValues: info.coreValues.map((value) => ({ value })),
    contacts: info.contacts.map((c) => ({
      type: (c.type in CONTACT_TYPES ? c.type : "other") as ContactType,
      label: c.label ?? "",
      value: c.value,
    })),
    socialLinks: info.socialLinks.map((s) => ({
      platform: (s.platform in SOCIAL_PLATFORMS ? s.platform : "other") as SocialPlatform,
      handle: s.handle,
    })),
    aboutPhotoUrl: info.aboutPhotoUrl ?? "",
    namesakeName: info.namesakeName ?? "",
    namesakePhotoUrl: info.namesakePhotoUrl ?? "",
    namesakeBirth: info.namesakeBirth ?? "",
    namesakeDeath: info.namesakeDeath ?? "",
    namesakeAbout: info.namesakeAbout ?? "",
  };
}

/** The school's public profile: one record, edited in place. */
export function SchoolInfoForm({ info }: { info: SchoolInfo }) {
  const canEdit = usePermission("school.update");
  const initial = toFormValues(info);
  const form = useForm<SchoolInfoFormValues, unknown, SchoolInfoFormOutput>({
    resolver: zodResolver(schoolInfoFormSchema),
    defaultValues: initial,
    values: initial,
    disabled: !canEdit,
  });
  const save = useServerMutation(updateSchoolInfoAction, {
    form,
    successMessage: "School information saved",
  });
  const c = form.control;

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) => save.mutate(values))}
      >
        <FormSection title="Identity" description="How the school is named and presented.">
          <TextField control={c} name="name" label="School name" required />
          <TextField control={c} name="motto" label="Motto" />
          <NumberField
            control={c}
            name="foundedYear"
            label="Founded (year)"
            nullable
            placeholder="e.g. 1904"
          />
          <div className="hidden sm:block" />
          <ImageField
            control={c}
            name="logoUrl"
            label="Logo / crest"
            folder="school"
            shape="square"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection title="Vision & mission">
          <RichTextField
            control={c}
            name="vision"
            label="Vision"
            className="sm:col-span-2"
            maxLength={5000}
          />
          <RichTextField
            control={c}
            name="mission"
            label="Mission"
            className="sm:col-span-2"
            maxLength={5000}
          />
          <ListField
            control={c}
            name="coreValues"
            emptyRow={{ value: "" }}
            addLabel="Add core value"
            emptyText="No core values yet."
            disabled={!canEdit}
            renderRow={(i) => (
              <TextField control={c} name={`coreValues.${i}.value`} label={`Core value ${i + 1}`} />
            )}
          />
        </FormSection>

        <FormSection title="About" description="Shown on the website's About page.">
          <ImageField
            control={c}
            name="aboutPhotoUrl"
            label="About photo"
            description="A photo of the school, shown with the About text and on the home page."
            folder="school"
            shape="landscape"
            className="sm:col-span-2"
          />
          <RichTextField
            control={c}
            name="about"
            label="About"
            className="sm:col-span-2"
            imageFolder="school"
          />
          <RichTextField
            control={c}
            name="history"
            label="History"
            className="sm:col-span-2"
            imageFolder="school"
          />
        </FormSection>

        <FormSection title="Our namesake" description="The person the school is named after.">
          <TextField control={c} name="namesakeName" label="Name" className="sm:col-span-2" />
          <TextField
            control={c}
            name="namesakeBirth"
            label="Born"
            placeholder="e.g. 12 March 1850, Dayton, Ohio"
            description="A full date, just a year, and/or a place."
          />
          <TextField
            control={c}
            name="namesakeDeath"
            label="Died"
            placeholder="e.g. 1915"
            description="Leave empty if not known."
          />
          <ImageField
            control={c}
            name="namesakePhotoUrl"
            label="Photo"
            folder="school"
            shape="portrait"
            className="sm:col-span-2"
          />
          <RichTextField
            control={c}
            name="namesakeAbout"
            label="About"
            description="Who they were and why the school bears their name."
            className="sm:col-span-2"
            imageFolder="school"
          />
        </FormSection>

        <FormSection title="Contacts" description="Phone numbers, emails and addresses.">
          <ListField
            control={c}
            name="contacts"
            emptyRow={{ type: "phone", label: "", value: "" }}
            addLabel="Add contact"
            emptyText="No contacts yet."
            disabled={!canEdit}
            renderRow={(i) => (
              <>
                <SelectField
                  control={c}
                  name={`contacts.${i}.type`}
                  label="Type"
                  options={toOptions(CONTACT_TYPES)}
                />
                <TextField
                  control={c}
                  name={`contacts.${i}.label`}
                  label="Label"
                  placeholder="e.g. Admissions"
                />
                <TextField control={c} name={`contacts.${i}.value`} label="Value" required />
              </>
            )}
          />
        </FormSection>

        <FormSection title="Social media" description="Profile links or handles.">
          <ListField
            control={c}
            name="socialLinks"
            emptyRow={{ platform: "facebook", handle: "" }}
            addLabel="Add social media"
            emptyText="No social media handles yet."
            disabled={!canEdit}
            renderRow={(i) => (
              <>
                <SelectField
                  control={c}
                  name={`socialLinks.${i}.platform`}
                  label="Platform"
                  options={toOptions(SOCIAL_PLATFORMS)}
                />
                <TextField
                  control={c}
                  name={`socialLinks.${i}.handle`}
                  label="Link or handle"
                  required
                  placeholder="https://facebook.com/… or @handle"
                />
              </>
            )}
          />
        </FormSection>

        {canEdit && (
          <FormActions>
            <span className="mr-auto self-center text-xs text-muted-foreground">
              Last saved <RelativeTime value={info.updatedAt} />
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={!form.formState.isDirty || save.isPending}
              onClick={() => form.reset(initial)}
            >
              Discard changes
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </FormActions>
        )}
      </form>
    </Form>
  );
}
