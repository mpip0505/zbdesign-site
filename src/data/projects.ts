import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ProjectType } from '../content.config';

export type Project = CollectionEntry<'projects'>;
export type Stage = 'design' | 'completion';

export interface ProjectWithImages extends Project {
  images: Record<Stage, ImageMetadata[]>;
  cover: ImageMetadata | undefined;
}

/** Image data handed to the client-side project viewer. */
export interface ViewerImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

export interface ViewerProject {
  title: string;
  caption: string;
  design: ViewerImage[];
  completion: ViewerImage[];
}

export const typeLabels: Record<ProjectType, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
};

export const stageLabels: Record<Stage, string> = {
  design: 'Design stage',
  completion: 'Completion',
};

const files = import.meta.glob<ImageMetadata>(
  '/src/assets/projects/*/{design,completion}/*.{jpg,jpeg,png,webp,avif}',
  { eager: true, import: 'default' },
);

function imagesFor(slug: string, stage: Stage): ImageMetadata[] {
  const prefix = `/src/assets/projects/${slug}/${stage}/`;
  return Object.keys(files)
    .filter((path) => path.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .flatMap((path) => files[path] ?? []);
}

/** Shows unconfirmed types in brackets so they stand out until the client confirms. */
export function typeLabel(project: Project): string {
  const label = typeLabels[project.data.type];
  return project.data.typeConfirmed ? label : `[${label}]`;
}

/** All projects with their images, newest first. */
export async function getProjects(): Promise<ProjectWithImages[]> {
  const projects = await getCollection('projects');
  const code = (p: Project) => Number(p.data.code.slice(2));
  return projects
    .sort((a, b) => b.data.year - a.data.year || code(b) - code(a))
    .map((project) => {
      const images = {
        design: imagesFor(project.id, 'design'),
        completion: imagesFor(project.id, 'completion'),
      };
      return { ...project, images, cover: images.completion[0] ?? images.design[0] };
    });
}

export async function toViewerProject(project: ProjectWithImages): Promise<ViewerProject> {
  const { title, year } = project.data;
  const convert = (stage: Stage) =>
    Promise.all(
      project.images[stage].map(async (src, i, all) => {
        const img = await getImage({ src, widths: [800, 1400, 2000], format: 'webp' });
        return {
          src: img.src,
          srcset: img.srcSet.attribute,
          width: src.width,
          height: src.height,
          alt: `${title}, ${stageLabels[stage].toLowerCase()} image ${i + 1} of ${all.length}`,
        };
      }),
    );
  return {
    title,
    caption: `${title} · ${typeLabel(project)} · ${year}`,
    design: await convert('design'),
    completion: await convert('completion'),
  };
}
