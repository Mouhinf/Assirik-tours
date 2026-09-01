import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function NewBlogPostPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "blog:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Nouvel article</h1>
        <p className="mt-1 text-graphite">
          Rédigez l&apos;article en Markdown léger. L&apos;aperçu à droite se met à jour pendant la frappe.
        </p>
      </header>
      <BlogPostForm
        mode="create"
        canPublish={can(session.role, "blog:publish")}
        canFeatured={can(session.role, "blog:featured")}
        canDelete={false}
      />
    </div>
  );
}
