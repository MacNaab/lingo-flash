import './PWABadge.css'

import { useRegisterSW } from 'virtual:pwa-register/react'

type Props = {
  nativeLang: 'fr' | 'es'
}

function PWABadge({ nativeLang }: Props) {
  // check for updates every hour
  const period = 60 * 60 * 1000

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      }
      else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated')
            registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      { (offlineReady || needRefresh)
      && (
        <div className="PWABadge-toast">
          <div className="PWABadge-message">
            { offlineReady
              ? <span id="toast-message">{nativeLang === 'fr' ? "App prête pour hors connexion" : "App lista para modo sin conexión"}</span>
              : <span id="toast-message">{nativeLang === 'fr' ? "Nouveau contenu disponible, cliquez pour recharger." : "Nuevo contenido disponible, recarga para actualizar."}</span>}
          </div>
          <div className="PWABadge-buttons">
            { needRefresh && <button className="PWABadge-toast-button" onClick={() => updateServiceWorker(true)}>Reload</button> }
            <button className="PWABadge-toast-button" onClick={() => close()}>{nativeLang === 'fr' ? "Fermer" : "Cerrar"}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200)
      await r.update()
  }, period)
}
