import { FEATURES } from "@/lib/data";

export default function FeatureGrid() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                    Everything you need
                </h2>
                <p className="text-base text-muted-foreground">
                    One place for all your investments, big and small.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map((f) => (
                    <div
                        key={f.title}
                        className="bg-card border border-border rounded-xl p-8 shadow-lg
                            hover:border-ring/100 transition-colors duration-150"
                    >
                        <div className="text-4xl mb-3">{f.icon}</div>
                        <h3 className="font-semibold text-lg text-card-foreground mb-2">{f.title}</h3>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}