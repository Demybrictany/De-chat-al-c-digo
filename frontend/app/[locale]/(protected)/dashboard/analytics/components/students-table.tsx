import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Listado estatico de estudiantes (curso 17217). Sin backend por ahora.
const students = [
  { firstName: "Marco André", lastName: "Bolaños Rojas", email: "MarcoBolanos@umes.edu.gt" },
  { firstName: "Giovanni Fernando", lastName: "De León Coyoy", email: "gfdeleon16@umes.edu.gt" },
  { firstName: "Deny Brictany", lastName: "De León Figueroa", email: "DenyFigueroa@umes.edu.gt" },
  { firstName: "Joshua David", lastName: "Flores Morales", email: "joshuadflores@umes.edu.gt" },
  { firstName: "Marvin Alfonso", lastName: "Fuentes Monzón", email: "marvinfuentes0507@umes.edu.gt" },
  { firstName: "Kenneth David", lastName: "García Ramirez", email: "Kennethdavidgr@umes.edu.gt" },
  { firstName: "Adrian Pablo José", lastName: "Girón Franco", email: "PabloGiron@umes.edu.gt" },
  { firstName: "Mario Fernando", lastName: "Guzmán Parada", email: "MarioGuzman@umes.edu.gt" },
  { firstName: "Andrea Gabriela", lastName: "López Hidalgo", email: "Andrealh2507@umes.edu.gt" },
  { firstName: "Pedro Javier", lastName: "López López", email: "lopezpedro@umes.edu.gt" },
  { firstName: "Juan José Efraín", lastName: "Martínez Delgado", email: "JJMartinezD@umes.edu.gt" },
  { firstName: "Johan Ricardo", lastName: "Méndez Rodríguez", email: "Jmendez@umes.edu.gt" },
  { firstName: "Douglas Gerardo", lastName: "Morales Velásquez", email: "Doumorales17@umes.edu.gt" },
  { firstName: "Sebástian André", lastName: "Orozco Orozco", email: "SebastianAndreO@umes.edu.gt" },
  { firstName: "Angel Glicerio", lastName: "Ovalle Fernández", email: "angelovalle10@umes.edu.gt" },
  { firstName: "Christian José", lastName: "Ramírez Solano", email: "christian_ramsol@umes.edu.gt" },
  { firstName: "Nathaly Saraí", lastName: "Reyes Cifuentes", email: "Nathaly_Reyes@umes.edu.gt" },
  { firstName: "Ethan Eduardo", lastName: "Ruíz Estrada", email: "ethanruiz25@umes.edu.gt" },
  { firstName: "Marco Pablo", lastName: "Sigüenza Orozco", email: "marcop62@umes.edu.gt" },
  { firstName: "Luis Emmanuel", lastName: "Suárez Menchú", email: "luissuarez@umes.edu.gt" },
  { firstName: "Emerson Basilio", lastName: "Tahay Menchú", email: "emerson_tahay@umes.edu.gt" },
  { firstName: "Josué Fernando", lastName: "Vásquez Yax", email: "jfvasquez@umes.edu.gt" },
];

const StudentsTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Apellidos</TableHead>
          <TableHead>Correo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((s, i) => (
          <TableRow key={s.email}>
            <TableCell className="text-default-500">{i + 1}</TableCell>
            <TableCell className="font-medium text-default-800">{s.firstName}</TableCell>
            <TableCell className="text-default-600">{s.lastName}</TableCell>
            <TableCell className="normal-case text-default-600">{s.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StudentsTable;
