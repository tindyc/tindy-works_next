const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const adminUserId = process.env.ADMIN_USER_ID?.trim()
const adminEmail = process.env.ADMIN_EMAIL?.trim()
const adminRole = process.env.ADMIN_ROLE?.trim() || 'admin'

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY')
}

if (!adminUserId && !adminEmail) {
  throw new Error(
    'Missing admin target. Add ADMIN_USER_ID or ADMIN_EMAIL to your environment. ADMIN_USER_ID wins if both are set.'
  )
}

async function findUserByEmail(supabase, email) {
  let page = 1
  const perPage = 100

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) throw error

    const targetUser = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    )

    if (targetUser) return targetUser
    if (data.users.length < perPage) return null

    page += 1
  }
}

async function getTargetUser(supabase) {
  if (adminUserId) {
    const { data, error } = await supabase.auth.admin.getUserById(adminUserId)

    if (error) throw error
    return data.user
  }

  return findUserByEmail(supabase, adminEmail)
}

async function run() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const targetUser = await getTargetUser(supabase)

  if (!targetUser) {
    throw new Error(
      'Admin user not found. Create the user in Supabase Auth first, then rerun this script.'
    )
  }

  const existingAppMetadata = targetUser.app_metadata ?? {}
  const nextAppMetadata = {
    ...existingAppMetadata,
    role: adminRole,
  }

  const { data, error } = await supabase.auth.admin.updateUserById(targetUser.id, {
    app_metadata: nextAppMetadata,
  })

  if (error) throw error

  console.log('✅ Admin role set')
  console.log(`User ID: ${data.user.id}`)
  console.log(`Email: ${data.user.email ?? '(none)'}`)
  console.log('App metadata:', data.user.app_metadata)
}

run().catch((error) => {
  console.error('❌ Error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
