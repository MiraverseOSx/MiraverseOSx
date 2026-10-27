import { useEffect, useState } from "react";
import type { LabRecord } from "@/lib/records";
import {
  getDGAState,
  initDGAStore,
  setActiveDGACase,
  subscribeDGAState,
} from "@/lib/dga-store";
import {
  hasRequiredClearance,
  resolveDGAAuthority,
} from "@/lib/dga-permissions";
import { DgaOperationsWorkspace } from "@/components/dga/dga-operations-workspace";

interface LegalDeskProps {
  cases: LabRecord[];
  evidence: LabRecord[];
  exams: LabRecord[];
  reports: LabRecord[];
  onOpenRecord: (record: LabRecord) => void;
  navigate: (view: string) => void;
}
/** The laboratory and agency use the same persistent legal records. */
export function LegalDesk({ cases, onOpenRecord, navigate }: LegalDeskProps) {
  const [state, setState] = useState(getDGAState);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const off = subscribeDGAState(setState);
    void initDGAStore();
    return off;
  }, []);
  const authority = resolveDGAAuthority({ profile: state.profile });
  if (!authority.allowedWorkspaces.includes("operations"))
    return (
      <div className="p-6 text-sm">
        Agency operations credentials are required to access legal records.
      </div>
    );
  const scoped = {
    ...state,
    cases: state.cases.filter((c) =>
      hasRequiredClearance(
        { clearanceLevel: authority.clearanceLevel },
        c.classification,
      ),
    ),
  };
  return (
    <div className="h-full flex flex-col">
      {notice && (
        <p role="status" className="p-3 text-xs bg-[#eeedf5]">
          {notice}
        </p>
      )}
      <div className="flex-1 min-h-0">
        <DgaOperationsWorkspace
          state={scoped}
          authority={authority}
          initialTab="records"
          onOpenCase={(id) => {
            void setActiveDGACase(id);
            setNotice(
              `Case ${id} selected. Its full file is available in DGAOS → Cases.`,
            );
          }}
          onOpenTrace={(id) => {
            const record = cases.find((c) => c.id === id);
            if (record) onOpenRecord(record);
            else navigate("Cases");
          }}
        />
      </div>
    </div>
  );
}
