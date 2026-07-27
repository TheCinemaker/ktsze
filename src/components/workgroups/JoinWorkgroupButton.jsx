import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Clock, Check, LogIn, X } from 'lucide-react';

import { requestJoinWorkgroup, leaveWorkgroup } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal, TextArea, Spinner, ConfirmDialog } from '../ui';

/**
 * Csatlakozás egy munkacsoporthoz.
 *
 * Négy állapotot kezel:
 *   1. nincs belépve      -> a belépő/regisztrációs oldalra visz, és utána
 *                            visszatér ide
 *   2. nincs jelentkezés  -> "Csatlakozom" + rövid bemutatkozás
 *   3. elbírálás alatt    -> tájékoztatás + visszavonás
 *   4. jóváhagyott tag    -> "Tagja vagy" + kilépés
 *
 * A jóváhagyást NEM a felhasználó adja: az adatbázis csak 'pending' állapotú
 * sort engedi neki létrehozni.
 */
export const JoinWorkgroupButton = ({ workgroup, membership, onChanged, size = 'default' }) => {
  const { isAuthenticated, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [joinOpen, setJoinOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const sizeClass = size === 'small' ? 'btn-sm' : '';

  // --- 1. Nincs belépve -------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() =>
          navigate('/belepes', {
            state: { from: location.pathname, reason: `a(z) „${workgroup.name}” munkacsoporthoz csatlakozáshoz` }
          })
        }
        className={`btn-primary ${sizeClass}`}
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Belépés a csatlakozáshoz
      </button>
    );
  }

  // --- 4. Már jóváhagyott tag -------------------------------------------------
  if (membership?.status === 'approved') {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-positive">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Tagja vagy
          </span>
          <button type="button" onClick={() => setConfirmLeave(true)} className={`btn-ghost ${sizeClass}`}>
            Kilépés
          </button>
        </div>

        <ConfirmDialog
          open={confirmLeave}
          onClose={() => setConfirmLeave(false)}
          pending={pending}
          title="Kilépés a munkacsoportból"
          message={`Biztosan kilépsz a(z) „${workgroup.name}” munkacsoportból? Később újra jelentkezhetsz, de akkor ismét jóváhagyásra vár.`}
          confirmLabel="Igen, kilépek"
          onConfirm={async () => {
            setPending(true);
            try {
              await leaveWorkgroup(membership.id);
              toast.info('Kiléptél a munkacsoportból.');
              await onChanged();
              setConfirmLeave(false);
            } catch (err) {
              toast.error(err.message);
            } finally {
              setPending(false);
            }
          }}
        />
      </>
    );
  }

  // --- 3. Elbírálás alatt -----------------------------------------------------
  if (membership?.status === 'pending') {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-caution">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Elbírálás alatt
          </span>
          <button type="button" onClick={() => setConfirmLeave(true)} className={`btn-ghost ${sizeClass}`}>
            Visszavonom
          </button>
        </div>

        <ConfirmDialog
          open={confirmLeave}
          onClose={() => setConfirmLeave(false)}
          pending={pending}
          title="Jelentkezés visszavonása"
          message={`Visszavonod a jelentkezésedet a(z) „${workgroup.name}” munkacsoportba?`}
          confirmLabel="Igen, visszavonom"
          onConfirm={async () => {
            setPending(true);
            try {
              await leaveWorkgroup(membership.id);
              toast.info('A jelentkezésedet visszavontuk.');
              await onChanged();
              setConfirmLeave(false);
            } catch (err) {
              toast.error(err.message);
            } finally {
              setPending(false);
            }
          }}
        />
      </>
    );
  }

  // --- Elutasított ------------------------------------------------------------
  if (membership?.status === 'rejected') {
    return (
      <div className="space-y-1.5">
        <span className="badge-neutral">
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          A jelentkezést elutasították
        </span>
        {membership.decision_note && <p className="text-xs text-ink-500">{membership.decision_note}</p>}
      </div>
    );
  }

  // --- 2. Még nem jelentkezett ------------------------------------------------
  const handleJoin = async () => {
    setPending(true);
    try {
      await requestJoinWorkgroup(workgroup.id, profile.id, message);
      toast.success('Jelentkezésedet rögzítettük. A csoport vezetője vagy az elnökség hagyja jóvá.');
      setJoinOpen(false);
      setMessage('');
      await onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setJoinOpen(true)} className={`btn-primary ${sizeClass}`}>
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Csatlakozom
      </button>

      <Modal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        title={`Jelentkezés: ${workgroup.name}`}
        description="A jelentkezést a csoport vezetője vagy az elnökség bírálja el."
        size="sm"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setJoinOpen(false)} disabled={pending}>
              Mégsem
            </button>
            <button type="button" className="btn-primary" onClick={handleJoin} disabled={pending}>
              {pending ? <Spinner label="Küldés…" className="text-white" /> : 'Jelentkezés elküldése'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {workgroup.description && (
            <div className="surface p-3">
              <p className="text-sm text-ink-600">{workgroup.description}</p>
            </div>
          )}

          <TextArea
            label="Pár szó magadról"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            hint="Nem kötelező, de segít az elbírálásban: mivel foglalkozol, miben tudsz részt venni."
          />

          <p className="text-xs text-ink-500">
            A jelentkezéssel a neved és az elérhetőségeid láthatóvá válnak a csoport vezetője és az elnökség számára.
          </p>
        </div>
      </Modal>
    </>
  );
};
