import type { ReactNode } from 'react';
import Link from '@/components/ui/NavLink';
import { PageSurface } from '@/components/ui/PageSurface';
import { LabHeader } from '@/components/ui/LabHeader';
import { riseDelay } from '@/lib/motion';

const CONTACT_EMAIL = 'gripkicksofficial@gmail.com';
const LAST_UPDATED = '15 November 2026';

const sections = [
  { id: 'short', title: 'In short' },
  { id: 'collect', title: 'What we collect' },
  { id: 'services', title: 'Who handles it' },
  { id: 'choices', title: 'Your choices' },
] as const;

const principles = [
  { title: 'Not for sale', body: 'We do not sell or rent your personal data, and we do not share it for advertising.' },
  { title: 'Yours to delete', body: 'Deleting your account removes your profile, foot profile, shoes and ratings from our database.' },
  { title: 'Only what is needed', body: 'We keep what it takes to run your account and match shoes, plus usage analytics to fix and improve the app.' },
];

const ACCOUNT_LIFETIME = 'Until you delete your account';

const collected: Array<{ data: string; why: string; kept: string }> = [
  { data: 'Account basics', why: 'Name and email, so you can sign in and we can reach you.', kept: ACCOUNT_LIFETIME },
  { data: 'Foot profile', why: 'Shape and volume, to match you with shoes and with climbers whose feet are like yours.', kept: ACCOUNT_LIFETIME },
  { data: 'Shoe ratings', why: 'Size, comfort, performance and durability, to power recommendations.', kept: ACCOUNT_LIFETIME },
  { data: 'Shoe collection', why: 'The shoes you own or have tried.', kept: ACCOUNT_LIFETIME },
  {
    data: 'Usage analytics',
    why: 'Pages you visit, clicks, and sign-up and Sanctuary events, with browser, device type and approximate location from your IP address. Linked to your email once you sign up.',
    kept: 'Stored by PostHog in the EU. Account deletion does not remove it yet; email us and we will delete it.',
  },
];

const services = [
  { name: 'Convex', role: 'Database for your account, foot profile, shoes and ratings.' },
  { name: 'Render', role: 'Runs the GripKicks API that handles sign-in and account changes.' },
  { name: 'PostHog (EU)', role: 'Usage analytics.' },
  { name: 'ImageKit', role: 'Serves shoe images. No personal data.' },
];

function Section({ id, title, index, children }: { id: string; title: string; index: number; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="lab-rise scroll-mt-24" style={riseDelay(index)}>
      <div className="mb-fluid-md flex items-center gap-fluid-lg">
        <h2 id={`${id}-title`} className="lab-title text-fluid-xl">{title}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
      </div>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <PageSurface>
      <div className="lab-container">
        <LabHeader title="Privacy" description={`Last updated ${LAST_UPDATED}.`} />

        <div className="grid gap-fluid-2xl lg:grid-cols-[11rem_minmax(0,1fr)]">
          <nav aria-label="Privacy sections" className="hidden lg:block">
            <ul className="lab-rise sticky top-24 space-y-1 border-l border-white/10" style={riseDelay(1)}>
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 font-mono text-xs uppercase tracking-wider text-brand-putty transition-colors duration-300 hover:border-brand-red hover:text-brand-chalk focus-visible:outline-brand-chalk"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-fluid-2xl">
            <Section id="short" title="In short" index={1}>
              <ul className="grid gap-4 md:grid-cols-3">
                {principles.map((item) => (
                  <li key={item.title} className="lab-card p-fluid-lg">
                    <h3 className="lab-title text-base text-white">{item.title}</h3>
                    <p className="mt-2 font-mono text-sm leading-relaxed text-brand-putty">{item.body}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="collect" title="What we collect" index={2}>
              <div className="lab-card">
                <table className="w-full text-left font-mono text-sm">
                  <thead className="hidden md:table-header-group">
                    <tr className="border-b border-white/6">
                      <th scope="col" className="lab-label w-[22%] px-fluid-lg py-3 font-normal">Data</th>
                      <th scope="col" className="lab-label px-fluid-lg py-3 font-normal">Why</th>
                      <th scope="col" className="lab-label w-[28%] px-fluid-lg py-3 font-normal">How long</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collected.map((row) => (
                      <tr key={row.data} className="block border-b border-white/6 px-fluid-lg py-4 last:border-b-0 md:table-row md:p-0">
                        <th scope="row" className="block font-normal text-brand-chalk md:table-cell md:px-fluid-lg md:py-4 md:align-top">{row.data}</th>
                        <td className="mt-1 block leading-relaxed text-brand-putty md:mt-0 md:table-cell md:px-fluid-lg md:py-4 md:align-top">{row.why}</td>
                        <td className="mt-2 block text-xs leading-relaxed text-brand-putty/70 md:mt-0 md:table-cell md:px-fluid-lg md:py-4 md:align-top md:text-sm">{row.kept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 font-mono text-sm leading-relaxed text-brand-putty/80">
                We don&apos;t collect contacts, photos, precise location, or anything else that isn&apos;t needed to run GripKicks.
              </p>
            </Section>

            <Section id="services" title="Who handles it" index={3}>
              <dl className="lab-card divide-y divide-white/6">
                {services.map((service) => (
                  <div key={service.name} className="grid gap-1 px-fluid-lg py-4 font-mono text-sm sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-fluid-md">
                    <dt className="text-brand-chalk">{service.name}</dt>
                    <dd className="text-brand-putty">{service.role}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section id="choices" title="Your choices" index={4}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="lab-card flex flex-col justify-between gap-fluid-md p-fluid-lg">
                  <div>
                    <h3 className="lab-title text-base text-white">Delete your account</h3>
                    <p className="mt-2 font-mono text-sm leading-relaxed text-brand-putty">Profile, then Danger Zone.</p>
                  </div>
                  <Link href="/profile" className="lab-button-ghost self-start">Open profile</Link>
                </div>
                <div className="lab-card flex flex-col justify-between gap-fluid-md p-fluid-lg">
                  <div>
                    <h3 className="lab-title text-base text-white">Get a copy</h3>
                    <p className="mt-2 font-mono text-sm leading-relaxed text-brand-putty">Email us and we&apos;ll send your data.</p>
                  </div>
                  <a href={`mailto:${CONTACT_EMAIL}?subject=Data%20request`} className="lab-button-ghost self-start">Request data</a>
                </div>
                <div className="lab-card flex flex-col justify-between gap-fluid-md p-fluid-lg">
                  <div>
                    <h3 className="lab-title text-base text-white">Questions</h3>
                    <p className="mt-2 break-all font-mono text-sm leading-relaxed text-brand-putty">{CONTACT_EMAIL}</p>
                  </div>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="lab-button-ghost self-start">Email us</a>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </PageSurface>
  );
}
