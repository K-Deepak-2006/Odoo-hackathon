import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Resend API Key - In production, this should be set as a Supabase secret
const RESEND_API_KEY = 're_AYw7cu2d_DJzHJBgvZxXwMKgxarzsZx9Y'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string
  subject: string
  html?: string
  type: 'request_sent' | 'request_accepted' | 'request_rejected'
  requestData?: {
    fromUserName: string
    toUserName: string
    message: string
  }
}

const getEmailTemplate = (type: string, requestData: any): string => {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://nkedmsegzsznwkzhcues.supabase.co'
  
  const baseStyle = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    overflow: hidden;
    color: #333;
  `
  
  const headerStyle = `
    background: white;
    padding: 30px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  `
  
  const contentStyle = `
    background: white;
    padding: 30px;
    margin: 0;
  `
  
  const buttonStyle = `
    display: inline-block;
    padding: 14px 28px;
    margin: 20px 0;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
  `

  switch (type) {
    case 'request_sent':
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="margin: 0; color: #6366f1; font-size: 28px;">🤝 SkillSwap</h1>
            <h2 style="margin: 10px 0 0 0; color: #4b5563; font-weight: 500;">New Skill Exchange Request</h2>
          </div>
          <div style="${contentStyle}">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi <strong>${requestData?.toUserName}</strong>,</p>
            
            <p style="font-size: 16px; color: #6b7280; line-height: 1.6;">
              You have received a new skill swap request from <strong style="color: #6366f1;">${requestData?.fromUserName}</strong>!
            </p>
            
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
              <p style="margin: 0; font-style: italic; color: #4b5563; font-size: 16px;">
                "${requestData?.message}"
              </p>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6;">
              Ready to start your skill exchange journey? Click below to view the request details and respond.
            </p>
            
            <a href="${siteUrl}/requests" 
               style="${buttonStyle} background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
              📩 View Request
            </a>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong style="color: #6366f1;">The SkillSwap Team</strong> 🚀
              </p>
            </div>
          </div>
        </div>
      `
        
    case 'request_accepted':
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="margin: 0; color: #10b981; font-size: 28px;">🎉 SkillSwap</h1>
            <h2 style="margin: 10px 0 0 0; color: #4b5563; font-weight: 500;">Request Accepted!</h2>
          </div>
          <div style="${contentStyle}">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi <strong>${requestData?.fromUserName}</strong>,</p>
            
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; text-align: center;">
              <p style="font-size: 20px; margin: 0; color: #065f46;">
                🎊 Fantastic news! 🎊
              </p>
            </div>
            
            <p style="font-size: 16px; color: #6b7280; line-height: 1.6;">
              <strong style="color: #10b981;">${requestData?.toUserName}</strong> has accepted your skill swap request! 
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">🗓️ Next Steps:</h3>
              <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
                <li>Coordinate your meeting schedule</li>
                <li>Choose your preferred communication platform</li>
                <li>Discuss specific topics to cover</li>
                <li>Plan session duration and frequency</li>
              </ul>
            </div>
            
            <a href="${siteUrl}/requests" 
               style="${buttonStyle} background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              💬 View Details & Start Planning
            </a>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Happy learning!<br>
                <strong style="color: #10b981;">The SkillSwap Team</strong> 🌟
              </p>
            </div>
          </div>
        </div>
      `
        
    case 'request_rejected':
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="margin: 0; color: #f59e0b; font-size: 28px;">📢 SkillSwap</h1>
            <h2 style="margin: 10px 0 0 0; color: #4b5563; font-weight: 500;">Request Update</h2>
          </div>
          <div style="${contentStyle}">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi <strong>${requestData?.fromUserName}</strong>,</p>
            
            <p style="font-size: 16px; color: #6b7280; line-height: 1.6;">
              <strong>${requestData?.toUserName}</strong> has decided not to proceed with your skill swap request at this time.
            </p>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 16px;">
                <strong>💡 Don't worry!</strong> This is just part of the journey. There are many other skilled individuals on SkillSwap who would love to connect with you.
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">🌟 Keep Growing:</h3>
              <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
                <li>Explore more profiles and skills</li>
                <li>Refine your skill offerings</li>
                <li>Send requests to multiple people</li>
                <li>Update your profile to attract more matches</li>
              </ul>
            </div>
            
            <a href="${siteUrl}/browse" 
               style="${buttonStyle} background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
              🔍 Browse More Skills
            </a>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Keep exploring and connecting!<br>
                <strong style="color: #6366f1;">The SkillSwap Team</strong> 💪
              </p>
            </div>
          </div>
        </div>
      `
        
    default:
      return '<p>Email notification</p>'
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, subject, html, type, requestData }: EmailPayload = await req.json()

    console.log('📧 Processing email notification:', {
      to,
      subject,
      type,
      timestamp: new Date().toISOString()
    })

    // Generate email content based on type
    const emailContent = html || getEmailTemplate(type, requestData)

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SkillSwap <noreply@skillswap.com>',
        to: [to],
        subject: subject,
        html: emailContent,
        tags: [
          { name: 'category', value: 'skill-swap' },
          { name: 'type', value: type }
        ]
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error('❌ Resend API error:', {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        error: errorText
      })
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send email',
          details: errorText 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const result = await resendResponse.json()
    console.log('✅ Email sent successfully:', { 
      id: result.id, 
      to,
      type,
      subject 
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        emailId: result.id,
        emailPreview: emailContent.substring(0, 200) + '...'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Error in email notification function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})