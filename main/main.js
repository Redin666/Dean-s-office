class Student {
    constructor(name, surname, specialty, englishScore) {
        this.name = name;
        this.surname = surname;
        this.specialty = specialty;
        this.englishScore = englishScore;
    }

    getStudentInfo() {
        return `${this.name} ${this.surname}, Специальность: ${this.specialty}, Результат английского: ${this.englishScore}`;
    }
}

class Group {
    constructor() {
        this.students = [];
    }

    getGroupInfo() {
        return this.students.map(student => student.getStudentInfo());
    }
}

class DekanManager {
    constructor() {
        this.groups = {};
    }

    createTable(data, groupName) {
        const table = document.createElement("table");
        table.className = "student-table";

        const tableHeader = document.createElement("tr");
        tableHeader.innerHTML = `
            <th>#</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Специальность</th>
            <th>Результат английского</th>
        `;
        table.appendChild(tableHeader);

        for (let i = 0; i < data.length; i++) {
            const student = data[i];
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${student.name}</td>
                <td>${student.surname}</td>
                <td>${student.specialty}</td>
                <td>${student.englishScore}</td>
            `;
            table.appendChild(row);
        }

        const groupTitle = document.createElement("p");
        groupTitle.textContent = `Группа ${groupName}`;
        groupTitle.className = "group-title";

        const outputTable = document.getElementById("outputTable");
        outputTable.appendChild(groupTitle);
        outputTable.appendChild(table);
    }

    createGroup() {
        return new Group();
    }

    addStudent(group, student) {
        group.students.push(student);
    }

	processStudentData() {
        const fileInput = document.getElementById("dataFile");
        const outputTable = document.getElementById("outputTable");
        const file = fileInput.files[0];
        const reader = new FileReader();

        // Create an error group to store students with missing data
        const errorGroup = this.createGroup();
        errorGroup.groupName = "Ошибка";

        reader.onload = (e) => {
            const data = e.target.result;
            const lines = data.split("\n").map((line) => line.trim());

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(",");
                const name = parts[0];
                const surname = parts[1];
                const specialty = parts[2];
                const englishScore = parseFloat(parts[3]);

                if (!this.groups[specialty]) {
                    this.groups[specialty] = this.createGroup();
                }

                if (
                    parts.length < 4 ||
                    !name ||
                    !surname ||
                    !specialty ||
                    isNaN(englishScore) ||
                    englishScore < 0 ||
                    englishScore > 100
                ) {
                    const errorStudent = new Student(
                        name || "Не указано",
                        surname || "Не указано",
                        specialty || "Не указано",
                        "Ошибка: Не хватает данных"
                    );
                    this.addStudent(errorGroup, errorStudent);
                } else {
                    const student = new Student(name, surname, specialty, englishScore);
                    this.addStudent(this.groups[specialty], student);
                }
            }

            outputTable.innerHTML = "";

            let groupId = 1;
            for (const specialty in this.groups) {
                const group = this.groups[specialty];
                const students = group.students;
                students.sort((a, b) => b.englishScore - a.englishScore);
                let currentGroup = [];
                let groupIndex = 1;

                for (const student of students) {
                    if (currentGroup.length >= 15) {
                        this.createTable(currentGroup, groupId);
                        currentGroup = [];
                        groupIndex++;
                        groupId++;
                    }

                    student.group = groupIndex;
                    currentGroup.push(student);
                }

                if (currentGroup.length > 0) {
                    this.createTable(currentGroup, groupId);
                    groupId++;
                }
            }

            if (errorGroup.students.length > 0) {
                this.createTable(errorGroup.students, "Ошибка");
            }
        };

        reader.readAsText(file);
    }
}

const dekanManager = new DekanManager();
document.getElementById("processButton").addEventListener("click", () => dekanManager.processStudentData());
