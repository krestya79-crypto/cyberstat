import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, WifiOff, CheckCircle2, X } from 'lucide-react';
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function useConnection() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
export function PwaControls() {
  const online = useConnection();
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [help, setHelp] = useState(false);
  const [message, setMessage] = useState('');
  const [registrationError, setRegistrationError] = useState(false);
  const {
    offlineReady: [ready, setReady],
    needRefresh: [refresh, setRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      setRegistrationError(true);
    },
  });
  useEffect(() => {
    const receive = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const installed = () => {
      setPrompt(null);
      setMessage('CyberStat is installed.');
    };
    window.addEventListener('beforeinstallprompt', receive);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', receive);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  useEffect(() => {
    const check = () => {
      if (navigator.onLine)
        void navigator.serviceWorker
          ?.getRegistration()
          .then((r) => r?.update())
          .catch(() => {});
    };
    const timer = window.setInterval(check, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  async function install() {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      setMessage(
        choice.outcome === 'accepted'
          ? 'Installation requested.'
          : 'You can install later from your browser menu.',
      );
    } else setHelp(!help);
  }
  return (
    <>
      <div className="pwa-tools">
        {!standalone && (
          <button className="install-button" onClick={() => void install()}>
            <Download size={16} /> Install app
          </button>
        )}
      </div>
      {!online && (
        <div className="status-banner" role="status">
          <WifiOff size={17} /> Offline ·{' '}
          {navigator.serviceWorker?.controller
            ? 'Use the saved app, calculators and lecture PDFs.'
            : 'Only resources already loaded in this tab may be available.'}
        </div>
      )}
      {registrationError && (
        <div className="status-banner warning" role="status">
          Offline setup failed. Reconnect and reload to try again; offline availability is not
          confirmed.
        </div>
      )}
      {ready && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>Ready for offline study, including all four lectures.</span>
          <button aria-label="Dismiss offline message" onClick={() => setReady(false)}>
            <X size={17} />
          </button>
        </div>
      )}
      {refresh && (
        <div className="toast update" role="status">
          <span>A new version is ready. Save your current inputs before reloading.</span>
          <button className="button primary" onClick={() => void updateServiceWorker(true)}>
            Update & reload
          </button>
          <button aria-label="Remind me later" onClick={() => setRefresh(false)}>
            <X size={17} />
          </button>
        </div>
      )}
      {help && (
        <section className="install-help" aria-label="Installation guidance">
          <div className="section-heading">
            <strong>Take your study desk with you</strong>
            <button aria-label="Close installation guidance" onClick={() => setHelp(false)}>
              <X size={18} />
            </button>
          </div>
          <p>
            In Chrome or Edge, use the browser menu → Install CyberStat / Install app. On iPhone or
            iPad, open in Safari and choose Share → Add to Home Screen.
          </p>
          <p className="muted">
            Installation is available on supported browsers over HTTPS or localhost. Load the app
            online once and wait for “Ready for offline study”. Everything is stored on this device.
          </p>
        </section>
      )}
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Dismiss installation message" onClick={() => setMessage('')}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
