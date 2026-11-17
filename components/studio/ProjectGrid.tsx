import Link from "next/link";
import { PROJECTS, type Project } from "../../lib/projects";

function ProjectMark({ index }: { index: number }) {
  const variant = index % 3;
  return (
    <svg className="project-mark" viewBox="0 0 64 64" aria-hidden="true">
      {variant === 0 ? (
        <polygon points="32 6 54 18 54 46 32 58 10 46 10 18" />
      ) : null}
      {variant === 1 ? (
        <>
          <circle cx="32" cy="32" r="18" />
          <path d="M32 10v8M32 46v8M10 32h8M46 32h8" />
        </>
      ) : null}
      {variant === 2 ? (
        <path d="M12 44 24 16h8L44 44M18 36h20" />
      ) : null}
    </svg>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <li>
      <Link href={project.href} className="project-card">
        <span className="project-edge" aria-hidden="true" />
        <svg className="project-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="5,1 95,1 99,5 99,95 95,99 5,99 1,95 1,5" />
        </svg>
        <ProjectMark index={index} />
        <span className={project.status === "live" ? "project-status project-status-live" : "project-status"}>
          {project.status === "live" ? <span className="hud-live-pip" aria-hidden="true" /> : null}
          {project.statusLabel}
        </span>
        <span className="project-name">{project.name}</span>
        <span className="project-tagline">{project.summary}</span>
        <span className="project-action">
          {project.action} <span aria-hidden="true">›</span>
        </span>
      </Link>
    </li>
  );
}

export function ProjectGrid() {
  return (
    <ul className="project-grid">
      {PROJECTS.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </ul>
  );
}
