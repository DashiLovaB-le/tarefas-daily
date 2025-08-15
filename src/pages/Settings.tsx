import { useState } from "react"
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserSettings {
  name: string
  email: string
  avatar: string
  notifications: {
    email: boolean
    push: boolean
    daily: boolean
    weekly: boolean
  }
  theme: 'light' | 'dark' | 'system'
  language: string
}

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    name: "João Silva",
    email: "joao.silva@email.com",
    avatar: "",
    notifications: {
      email: true,
      push: false,
      daily: true,
      weekly: true
    },
    theme: 'light',
    language: 'pt-BR'
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = async () => {
    setIsLoading(true)
    // Simula salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // TODO: Implementar salvamento real via Supabase
  }

  const handleExportData = () => {
    // TODO: Implementar exportação de dados em PDF
    console.log("Exportando dados do usuário...")
  }

  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e dados da conta
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Perfil</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={settings.avatar} />
                  <AvatarFallback className="text-xl font-semibold">
                    {settings.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Alterar Foto
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG ou GIF. Máximo 5MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="gradient-button"
              >
                {isLoading ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </div>
          </Card>

          {/* Notifications Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Notificações</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Notificações por E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(value) => updateNotification('email', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Notificações Push</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(value) => updateNotification('push', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Resumo Diário</p>
                  <p className="text-sm text-muted-foreground">
                    Resumo das tarefas todos os dias às 9h
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.daily}
                  onCheckedChange={(value) => updateNotification('daily', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Resumo Semanal</p>
                  <p className="text-sm text-muted-foreground">
                    Relatório de produtividade às segundas-feiras
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weekly}
                  onCheckedChange={(value) => updateNotification('weekly', value)}
                />
              </div>
            </div>
          </Card>

          {/* Security Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Segurança</h2>
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Ativar Autenticação de Dois Fatores
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Gerenciar Sessões Ativas
              </Button>
            </div>
          </Card>

          {/* Appearance Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Aparência</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Tema</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Button 
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                  >
                    Claro
                  </Button>
                  <Button 
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                  >
                    Escuro
                  </Button>
                  <Button 
                    variant={settings.theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setSettings(prev => ({ ...prev, theme: 'system' }))}
                  >
                    Sistema
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Export Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Exportar Dados</h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Exporte seus dados de tarefas e relatórios de produtividade
              </p>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Todos os Dados (PDF)
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/50">
            <h2 className="text-xl font-semibold text-destructive mb-4">Zona de Perigo</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Ações irreversíveis que afetam permanentemente sua conta
              </p>
              <div className="flex gap-4">
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Limpar Todos os Dados
                </Button>
                <Button variant="destructive">
                  Excluir Conta
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings