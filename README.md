
# CloudOps Dashboard

![React](https://img.shields.io/badge/react-18.2.0-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-5.4.2-3178C6?logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.19-06B6D4?logo=tailwindcss&logoColor=white) ![Vite](https://img.shields.io/badge/vite-5.0.0-646CFF?logo=vite&logoColor=white) ![React Router](https://img.shields.io/badge/react--router-6.18.0-CA4245) ![Recharts](https://img.shields.io/badge/recharts-2.15.4-2F8BFF) ![Lucide](https://img.shields.io/badge/lucide--react-0.268.0-111827)

Descripción
-----------

CloudOps Dashboard es una plantilla base para un dashboard de planificación y análisis de soluciones Cloud en AWS. Proporciona tipos TypeScript y datos simulados (mock) que facilitan la planificación de migraciones, análisis de costos y visualización de la infraestructura global sin necesidad de conectar servicios reales.

Tecnologías
-----------

- React — 18.2.0
- TypeScript — 5.4.2
- Tailwind CSS — 3.4.19
- Vite — 5.0.0
- React Router — 6.18.0
- Lucide React — 0.268.0
- Recharts — 2.15.4

Instalación
-----------

Clona el repositorio (si aplica) e instala dependencias:

```bash
git clone <REPO_URL>
cd cloudops-dashboard
npm install
```

Ejecución
---------

- Desarrollo (servidor local con hot-reload):

```bash
npm run dev
```

- Build producción:

```bash
npm run build
```

Funcionalidades (módulos)
-------------------------

1. Dashboard: Vista principal con métricas clave y estado general del entorno cloud.
2. Planificación Cloud: Herramientas para diseñar propuestas de migración y seleccionar servicios.
3. Costos: Estimaciones de coste por servicio, por región y cálculo de TCO básico.
4. Infraestructura Global: Mapa/tabla de regiones y recursos desplegados en cada región.
5. Seguridad: Resumen de identidades, políticas y recomendaciones de hardening.
6. Arquitectura de Red: Visualización de VPCs, subredes, ruteo y puntos de conexión.
7. Servicios AWS: Catálogo de servicios (EC2, S3, RDS, etc.) con descripciones y estado.

Nota: La UI incluirá soporte para modo oscuro (dark mode) configurable en futuras versiones.

Estructura del proyecto
-----------------------

Raíz relevante:

```
src/
├─ components/      # Componentes reutilizables (vacío inicialmente)
├─ pages/           # Páginas y rutas (vacío inicialmente)
├─ data/            # Datos mock (awsServices.ts, regions.ts)
├─ types/           # Tipos TypeScript (cloud.ts)
├─ styles/          # CSS / Tailwind entry
└─ main.tsx         # Entrada de la aplicación
```

Capturas
--------

Reemplaza estos placeholders con capturas reales del proyecto cuando estén disponibles.

- Dashboard:

	![Dashboard](./captures/dashboard.png)

- Planificación Cloud:

	![Planificación Cloud](./captures/planning.png)

- Costos:

	![Costos](./captures/costs.png)

- Infraestructura Global:

	![Infraestructura Global](./captures/infrastructure.png)

- Seguridad:

	![Seguridad](./captures/security.png)

- Arquitectura de Red:

	![Arquitectura de Red](./captures/network.png)

- Servicios AWS:

	![Servicios AWS](./captures/services.png)

- Vista móvil:

	![Vista Móvil](./captures/mobile.png)

Notas y siguientes pasos
------------------------

- Actualmente el proyecto incluye configuración base, tipos (`src/types/cloud.ts`) y datos mock (`src/data/*`). No hay componentes UI implementados todavía.
- Siguientes tareas sugeridas: implementar layout básico, rutas con React Router y los componentes por módulo.

Contacto
--------

Si necesitas que añada rutas placeholder o componentes iniciales, dime cuáles y los creo.

