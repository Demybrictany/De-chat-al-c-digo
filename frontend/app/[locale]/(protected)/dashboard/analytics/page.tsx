import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudentsTable from "./components/students-table";

const DashboardPage = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <StudentsTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
