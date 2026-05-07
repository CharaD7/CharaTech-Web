export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(config.public.supabaseProjectUrl as string, config.supabaseServiceKey as string)

    const formData = await readMultipartFormData(event)
    if (!formData) throw createError({ statusCode: 400, message: 'No file provided' })

    const file = formData.find(f => f.name === 'file')
    if (!file?.data) throw createError({ statusCode: 400, message: 'No file data' })

    const ext = file.filename?.split('.').pop() || 'bin'
    const fileName = `payment-proofs/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.data, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (error) throw createError({ statusCode: 500, message: `Upload failed: ${error.message}` })

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path)

    return { url: publicUrl, path: data.path }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload file',
    })
  }
})
