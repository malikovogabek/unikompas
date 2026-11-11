import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Header } from './Header'
import { NavigationProgress } from './NavigationProgress'
import { WakeBanner } from './WakeBanner'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <NavigationProgress />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WakeBanner />
    </div>
  )
}
