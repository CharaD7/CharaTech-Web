export default defineEventHandler(async (event) => {
  try {
    const adminEmail = 'jijakahn6@gmail.com'
    
    // Update user to admin role
    const user = await prisma.user.update({
      where: {
        email: adminEmail
      },
      data: {
        role: 'ADMIN'
      }
    })
    
    return {
      success: true,
      message: 'User updated to admin',
      user: {
        email: user.email,
        role: user.role
      }
    }
  } catch (error: any) {
    console.error('Error updating admin user:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update user to admin'
    })
  }
})
