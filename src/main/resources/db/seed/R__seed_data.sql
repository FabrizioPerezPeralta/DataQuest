-- Seed admin user (password: admin123)
INSERT IGNORE INTO users (correo, apodo, password_hash, role, activo)
VALUES ('admin@dataquest.com', 'Admin',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'ADMIN', TRUE);

-- Seed learning levels
INSERT IGNORE INTO learning_levels (world, level_number, title, description, initial_schema, expected_solution, theory, hints, xp, difficulty) VALUES
(1, 1, 'City of Attributes', 'Identify atomic attributes in a relation',
 'Clientes(id_cliente, nombre_completo, direccion_completa)',
 'Clientes(id_cliente, nombre, apellido, calle, numero, ciudad)',
 '1NF requires atomic values. No repeating groups or composite attributes.',
 'Split composite attributes into atomic parts', 100, 'EASY'),
(1, 2, 'Bridge of Dependencies', 'Find partial dependencies',
 'Pedidos(id_pedido, id_cliente, nombre_cliente, producto, precio)',
 'Pedidos(id_pedido, id_cliente, producto, precio); Clientes(id_cliente, nombre_cliente)',
 '2NF requires no partial dependencies. Every non-key attribute must depend on the whole key.',
 'Look for attributes that depend only on part of the composite key', 150, 'MEDIUM'),
(1, 3, 'Fortress of 2NF', 'Eliminate transitive dependencies',
 'Empleados(id_empleado, nombre, id_departamento, dept_nombre, dept_ubicacion)',
 'Empleados(id_empleado, nombre, id_departamento); Departamentos(id_departamento, dept_nombre, dept_ubicacion)',
 '3NF requires no transitive dependencies. Non-key attributes must not depend on other non-key attributes.',
 'Attributes that depend on other non-key attributes should be in a separate table', 200, 'MEDIUM'),
(1, 4, 'Sanctuary of 3NF', 'Achieve BCNF',
 'Profesores(id_profesor, curso, horario, aula)',
 'Profesores(id_profesor, curso); Cursos(curso, horario, aula)',
 'BCNF requires every determinant to be a candidate key.',
 'Every attribute on the left side of a FD must be a superkey', 300, 'HARD');

-- Seed medals
INSERT IGNORE INTO medals (nombre, descripcion, icono, tipo_condicion, valor_condicion) VALUES
('Iniciado', 'Completa tu primer nivel', 'star', 'XP_REACHED', 100),
('Detective Relacional', 'Resuelve 5 puzzles', 'search', 'PUZZLES_SOLVED', 5),
('Maestro de Formas', 'Alcanza 500 XP', 'trophy', 'XP_REACHED', 500),
('Colaborador Semanal', 'Completa 3 retos semanales', 'users', 'RETOS_COMPLETED', 3),
('Leyenda de DataQuest', 'Alcanza 2000 XP', 'crown', 'XP_REACHED', 2000);

-- Seed example puzzle
INSERT IGNORE INTO puzzles (enunciado, tablas_inicial, df_inicial, solucion_esperada, nivel_dificultad) VALUES
('Normaliza la tabla VENTAS a 3FN',
 'VENTAS(id_venta, id_producto, nombre_producto, id_cliente, nombre_cliente, fecha)',
 'id_venta -> id_producto, id_cliente, fecha; id_producto -> nombre_producto; id_cliente -> nombre_cliente',
 'VENTAS(id_venta, id_producto, id_cliente, fecha); PRODUCTOS(id_producto, nombre_producto); CLIENTES(id_cliente, nombre_cliente)',
 'MEDIUM');
