import LeadManager from "../../../components/LeadManager";

export const metadata = {
  title: "Target Repository - QuickReach",
};

export default function LeadsPage() {
  return (
    <div className="space-y-12 animate-entrance">
      <LeadManager />
    </div>
  );
}
