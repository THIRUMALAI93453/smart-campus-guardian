import { User, CheckCircle, XCircle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  status: "present" | "absent" | "proxy-flagged";
  engagement: "High" | "Medium" | "Low";
  seatNumber: string;
}

const mockStudents: Student[] = [
  { id: "1", name: "Aarav Sharma", status: "present", engagement: "High", seatNumber: "A1" },
  { id: "2", name: "Priya Patel", status: "present", engagement: "High", seatNumber: "A2" },
  { id: "3", name: "Rohan Gupta", status: "present", engagement: "Medium", seatNumber: "A3" },
  { id: "4", name: "Sneha Reddy", status: "absent", engagement: "Low", seatNumber: "A4" },
  { id: "5", name: "Vikram Singh", status: "present", engagement: "Low", seatNumber: "B1" },
  { id: "6", name: "Ananya Iyer", status: "present", engagement: "High", seatNumber: "B2" },
  { id: "7", name: "Karthik Nair", status: "proxy-flagged", engagement: "Medium", seatNumber: "B3" },
  { id: "8", name: "Meera Das", status: "present", engagement: "Medium", seatNumber: "B4" },
  { id: "9", name: "Arjun Kumar", status: "present", engagement: "High", seatNumber: "C1" },
  { id: "10", name: "Divya Joshi", status: "absent", engagement: "Low", seatNumber: "C2" },
];

const statusConfig = {
  present: { label: "Present", className: "bg-success/10 text-success" },
  absent: { label: "Absent", className: "bg-destructive/10 text-destructive" },
  "proxy-flagged": { label: "Proxy Flagged", className: "bg-warning/10 text-warning" },
};

const engagementConfig = {
  High: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-destructive/10 text-destructive",
};

export function StudentTable() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Student</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Seat</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map((student) => {
              const sConfig = statusConfig[student.status];
              return (
                <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground truncate">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{student.seatNumber}</td>
                  <td className="p-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${sConfig.className}`}>
                      {sConfig.label}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${engagementConfig[student.engagement]}`}>
                      {student.engagement}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
