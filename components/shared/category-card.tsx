import Link from "next/link";
import {
  Box,
  Cylinder,
  Construction,
  Triangle,
  Minus,
  Square,
  Circle,
  CornerDownRight,
  Link as LinkIcon,
  Lock,
  Wrench,
  Cable,
  Package,
  Home,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  box: Box,
  cylinder: Cylinder,
  construction: Construction,
  angle: Triangle,
  beam: Minus,
  sheet: Square,
  roof: Home,
  minus: Minus,
  square: Square,
  circle: Circle,
  corner: CornerDownRight,
  link: LinkIcon,
  lock: Lock,
  screw: Wrench,
  cable: Cable,
  package: Package,
};

interface CategoryCardProps {
  name: string;
  slug: string;
  productCount: number;
  icon: string;
}

export function CategoryCard({ name, slug, productCount, icon }: CategoryCardProps) {
  const Icon = iconMap[icon] || Package;

  return (
    <Link
      href={`/catalog/${slug}`}
      className="group flex flex-col items-center gap-3 rounded-xl border bg-white p-5 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-medium leading-tight">{name}</h3>
      <span className="text-xs text-muted-foreground">{productCount} товаров</span>
    </Link>
  );
}
