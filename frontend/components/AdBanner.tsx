import { cn } from "@/lib/utils";

interface AdBannerProps {
  position?: "left" | "right";
  className?: string;
}

export function AdBanner({ position = "right", className }: AdBannerProps) {
  return (
    <div className={cn("rounded-xl bg-white p-3 shadow-sm", className)}>
      <h4 className="mb-1 text-center text-xs font-semibold text-gray-700">Reklam Alanı</h4>
      <p className="mb-3 text-center text-[10px] text-gray-400 leading-tight">
        Burası {position === "left" ? "sol" : "sağ"} dikey reklam alanı içindir.
      </p>
      <div className="flex h-[280px] items-center justify-center rounded-lg bg-gray-100">
        <span className="text-xs text-gray-400">300x600 Banner</span>
      </div>
    </div>
  );
}
