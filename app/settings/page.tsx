'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings as SettingsIcon, 
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Eye,
  Volume2,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    labComplete: true,
    newLab: true,
    achievements: true,
    weeklyReport: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: true,
    showBadges: true,
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-600">Manage your preferences and account settings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">General Settings</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Choose your preferred language</p>
                </div>

                <div>
                  <Label htmlFor="timezone">Time Zone</Label>
                  <select
                    id="timezone"
                    className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+1 (Central European)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Set your local timezone</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Auto-save Progress</p>
                      <p className="text-xs text-slate-600">Automatically save your lab progress</p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>

                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Email Notifications</p>
                      <p className="text-xs text-slate-600">Receive notifications via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Push Notifications</p>
                      <p className="text-xs text-slate-600">Get push notifications on your device</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Notification Types</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'labComplete', label: 'Lab Completions', icon: CheckCircle, color: 'text-emerald-600' },
                      { key: 'newLab', label: 'New Labs Available', icon: Bell, color: 'text-blue-600' },
                      { key: 'achievements', label: 'Achievements & Badges', icon: Badge, color: 'text-amber-600' },
                      { key: 'weeklyReport', label: 'Weekly Progress Report', icon: AlertCircle, color: 'text-purple-600' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-sm text-slate-700">{item.label}</span>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            notifications[item.key as keyof typeof notifications] ? 'bg-slate-900' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">Privacy & Security</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Public Profile</p>
                        <p className="text-xs text-slate-600">Make your profile visible to others</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, profileVisible: !privacy.profileVisible })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacy.profileVisible ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Show Progress</p>
                        <p className="text-xs text-slate-600">Display your lab progress publicly</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showProgress: !privacy.showProgress })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacy.showProgress ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showProgress ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <Badge className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Show Badges</p>
                        <p className="text-xs text-slate-600">Display earned badges on profile</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showBadges: !privacy.showBadges })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacy.showBadges ? 'bg-amber-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showBadges ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Account Security</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Shield className="w-4 h-4" />
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>

                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">Appearance Settings</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-900 mb-3 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                      <Sun className="w-8 h-8 text-blue-600" />
                      <span className="text-sm font-medium text-slate-900">Light</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                      <Moon className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">Dark</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                      <Monitor className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">System</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-900 mb-3 block">Display Density</Label>
                  <div className="space-y-2">
                    {['Comfortable', 'Compact', 'Spacious'].map((density) => (
                      <button
                        key={density}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          density === 'Comfortable'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium text-slate-900">{density}</span>
                        {density === 'Comfortable' && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Sound Effects</p>
                      <p className="text-xs text-slate-600">Play sounds for interactions</p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>

                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Save Appearance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
