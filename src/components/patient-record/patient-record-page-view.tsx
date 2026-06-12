"use client";

import { PatientRecordView } from "@/components/patient-record/patient-record-view";
import { PageContainer } from "@/components/layout/page-container";
import type { PatientRecordData } from "@/app/actions/patient-record-actions";

type PatientRecordPageViewProps = {
  record: PatientRecordData;
};

export function PatientRecordPageView({ record }: PatientRecordPageViewProps) {
  return (
    <PageContainer size="wide">
      <PatientRecordView record={record} />
    </PageContainer>
  );
}
