package com.dataquest.infrastructure.config;

import com.dataquest.domain.Difficulty;
import com.dataquest.domain.MedalConditionType;
import com.dataquest.domain.UserRole;
import com.dataquest.infrastructure.persistence.entity.LearningLevelEntity;
import com.dataquest.infrastructure.persistence.entity.MedalEntity;
import com.dataquest.infrastructure.persistence.entity.UserEntity;
import com.dataquest.infrastructure.persistence.repository.SpringDataLearningLevelRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataMedalRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final SpringDataUserRepository userRepo;
    private final SpringDataLearningLevelRepository levelRepo;
    private final SpringDataMedalRepository medalRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(SpringDataUserRepository userRepo,
                           SpringDataLearningLevelRepository levelRepo,
                           SpringDataMedalRepository medalRepo,
                           PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.levelRepo = levelRepo;
        this.medalRepo = medalRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return;

        UserEntity admin = new UserEntity();
        admin.setCorreo("admin@dataquest.com");
        admin.setApodo("Admin");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole(UserRole.ADMIN);
        userRepo.save(admin);

        saveLevel(1, 1, "City of Attributes", "Identify atomic attributes",
            "Clientes(id_cliente, nombre_completo, direccion_completa)",
            "Clientes(id_cliente, nombre, apellido, calle, numero, ciudad)",
            "1NF requires atomic values.", "Split composite attributes", 100, Difficulty.EASY);

        saveLevel(1, 2, "Bridge of Dependencies", "Find partial dependencies",
            "Pedidos(id_pedido, id_cliente, nombre_cliente, producto, precio)",
            "Pedidos(id_pedido, id_cliente, producto, precio); Clientes(id_cliente, nombre_cliente)",
            "2NF requires no partial dependencies.", "Look for attributes that depend only on part of the key", 150, Difficulty.MEDIUM);

        saveLevel(1, 3, "Fortress of 2NF", "Eliminate transitive dependencies",
            "Empleados(id_empleado, nombre, id_departamento, dept_nombre, dept_ubicacion)",
            "Empleados(id_empleado, nombre, id_departamento); Departamentos(id_departamento, dept_nombre, dept_ubicacion)",
            "3NF requires no transitive dependencies.", "Attributes depending on other non-key attrs go in separate table", 200, Difficulty.MEDIUM);

        saveLevel(1, 4, "Sanctuary of 3NF", "Achieve BCNF",
            "Profesores(id_profesor, curso, horario, aula)",
            "Profesores(id_profesor, curso); Cursos(curso, horario, aula)",
            "BCNF requires every determinant to be a candidate key.", "Every left side FD must be a superkey", 300, Difficulty.HARD);

        saveMedal("Iniciado", "Completa tu primer nivel", "star", MedalConditionType.XP_REACHED, 100);
        saveMedal("Detective Relacional", "Resuelve 5 puzzles", "search", MedalConditionType.PUZZLES_SOLVED, 5);
        saveMedal("Maestro de Formas", "Alcanza 500 XP", "trophy", MedalConditionType.XP_REACHED, 500);
        saveMedal("Colaborador Semanal", "Completa 3 retos semanales", "users", MedalConditionType.RETOS_COMPLETED, 3);
        saveMedal("Leyenda de DataQuest", "Alcanza 2000 XP", "crown", MedalConditionType.XP_REACHED, 2000);
    }

    private void saveLevel(int world, int num, String title, String desc, String initSchema,
                           String solution, String theory, String hints, int xp, Difficulty diff) {
        LearningLevelEntity level = new LearningLevelEntity();
        level.setWorld(world);
        level.setLevelNumber(num);
        level.setTitle(title);
        level.setDescription(desc);
        level.setInitialSchema(initSchema);
        level.setExpectedSolution(solution);
        level.setTheory(theory);
        level.setHints(hints);
        level.setXp(xp);
        level.setDifficulty(diff);
        levelRepo.save(level);
    }

    private void saveMedal(String name, String desc, String icon, MedalConditionType type, int value) {
        MedalEntity medal = new MedalEntity();
        medal.setNombre(name);
        medal.setDescripcion(desc);
        medal.setIcono(icon);
        medal.setTipoCondicion(type);
        medal.setValorCondicion(value);
        medalRepo.save(medal);
    }
}
