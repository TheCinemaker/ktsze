import React, { useState, useMemo } from 'react';
import { Users, Flower2, Newspaper, FileText, Wallet, Settings, UserPlus, Mail, HelpCircle, Lightbulb, BarChart2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui';

import { MemberManagement } from '../components/admin/MemberManagement';
import { BoardIdeasAdmin } from '../components/admin/BoardIdeasAdmin';
import { SiteAnalyticsAdmin } from '../components/admin/SiteAnalyticsAdmin';
import { WorkgroupAdmin } from '../components/admin/WorkgroupAdmin';
import { WorkgroupApplications } from '../components/admin/WorkgroupApplications';
import { NewsEditor } from '../components/admin/NewsEditor';
import { DocumentAdmin } from '../components/admin/DocumentAdmin';
import { DuesRatesAdmin } from '../components/admin/DuesRatesAdmin';
import { NewsletterBroadcaster } from '../components/admin/NewsletterBroadcaster';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminUserManual } from '../components/admin/AdminUserManual';

const ALL_TABS = [
  { id: 'members', label: 'Tagnyilvántartás', icon: Users, permission: 'members.view', Component: MemberManagement },
  { id: 'analytics', label: '📊 Látogatottság & Analitika', icon: BarChart2, permission: 'members.view', Component: SiteAnalyticsAdmin },
  { id: 'ideas', label: 'Elnökségi Ötletelő', icon: Lightbulb, permission: 'members.view', Component: BoardIdeasAdmin },
  { id: 'newsletter', label: 'Hírlevél Küldése', icon: Mail, permission: 'members.view', Component: NewsletterBroadcaster },
  { id: 'news', label: 'Hírek', icon: Newspaper, permission: 'news.manage', Component: NewsEditor },
  { id: 'workgroups', label: 'Munkacsoportok', icon: Flower2, permission: 'workgroups.manage', Component: WorkgroupAdmin },
  { id: 'applications', label: 'Jelentkezések', icon: UserPlus, permission: 'workgroups.decide', Component: WorkgroupApplications },
  { id: 'documents', label: 'Dokumentumok', icon: FileText, permission: 'documents.manage', Component: DocumentAdmin },
  { id: 'dues', label: 'Tagdíjtételek', icon: Wallet, permission: 'duesRates.manage', Component: DuesRatesAdmin },
  { id: 'manual', label: 'Elnökségi Útmutató', icon: HelpCircle, permission: 'members.view', Component: AdminUserManual },
  { id: 'settings', label: 'Beállítások', icon: Settings, permission: 'settings.view', Component: AdminSettings }
];

export const AdminDashboardPage = () => {
  const { can, roleLabel, profile } = useAuth();

  const tabs = useMemo(() => ALL_TABS.filter((tab) => can(tab.permission)), [can]);
  const [activeId, setActiveId] = useState(null);

  const active = tabs.find((t) => t.id === activeId) || tabs[0];

  if (!active) {
    return (
      <div className="container-page py-16">
        <PageHeader
          eyebrow="Elnökségi felület"
          title="Nincs elérhető szakasz"
          description="A szerepköröd egyetlen elnökségi funkcióhoz sem ad hozzáférést. Jelezd a rendszergazdának."
        />
      </div>
    );
  }

  const ActiveComponent = active.Component;

  return (
    <div className="container-page space-y-8 py-12">
      <PageHeader
        eyebrow={roleLabel ? `Elnökségi felület — ${roleLabel}` : 'Elnökségi felület'}
        title="Egyesületi adminisztráció"
        description={profile?.custom_title || undefined}
      />

      <div className="tabbar" role="tablist" aria-label="Elnökségi szakaszok">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`admin-tab-${id}`}
            aria-selected={active.id === id}
            aria-controls={`admin-panel-${id}`}
            onClick={() => setActiveId(id)}
            className={`tab ${active.id === id ? 'tab-active' : ''}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div id={`admin-panel-${active.id}`} role="tabpanel" aria-labelledby={`admin-tab-${active.id}`}>
        <ActiveComponent />
      </div>
    </div>
  );
};
