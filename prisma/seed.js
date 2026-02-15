/* eslint-disable */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  console.log('🌱 Seeding VoiceBox database...\n');

  try {
    // =============================================
    // 1. USERS (5 users with alphanumeric IDs)
    // =============================================
    console.log('👤 Creating users...');

    const users = [
      ['AD01', '123456', 'admin@voicebox.com', 'Admin User', 'ADMIN'],
      ['JD01', '123456', 'john@voicebox.com', 'John Doe', 'USER'],
      ['SL01', '123456', 'sarah@voicebox.com', 'Sarah Lee', 'USER'],
      ['MJ01', '123456', 'mike@voicebox.com', 'Mike Johnson', 'USER'],
      ['HR01', '123456', 'hr@voicebox.com', 'HR Officer', 'HR'],
    ];

    const userIds = [];
    for (const [loginId, password, email, name, role] of users) {
      const res = await client.query(`
        INSERT INTO users ("loginId", password, email, name, role, "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (email) DO UPDATE 
        SET name = EXCLUDED.name, role = EXCLUDED.role, "loginId" = EXCLUDED."loginId", password = EXCLUDED.password
        RETURNING id, "loginId", name, role
      `, [loginId, password, email, name, role]);
      userIds.push(res.rows[0].id);
      console.log(`  ✅ ${res.rows[0].loginId} → ${res.rows[0].name} (${res.rows[0].role}) → id: ${res.rows[0].id}`);
    }

    // userIds: [admin, john, sarah, mike, hr]
    const [adminId, johnId, sarahId, mikeId] = userIds;

    // =============================================
    // 2. TICKETS (4 tickets from different users)
    // =============================================
    console.log('\n🎫 Creating tickets...');

    const tickets = [
      {
        title: 'Internet connection keeps dropping in Building A',
        description: 'The WiFi in Building A, Floor 3 has been intermittently dropping for the past 2 days. Multiple employees are affected and unable to join video calls. This is severely impacting our productivity and deadline commitments.',
        status: 'OPEN',
        priority: 'CRITICAL',
        category: 'IT Infrastructure',
        userId: johnId,
        aiAnalysis: JSON.stringify({
          category: 'IT Infrastructure',
          priority: 'CRITICAL',
          sentiment: 'ANGRY',
          suggestedAction: 'Escalate to IT networking team immediately',
          keywords: ['wifi', 'connectivity', 'network', 'outage'],
        }),
      },
      {
        title: 'Air conditioning not working in meeting room 5B',
        description: 'The air conditioning unit in meeting room 5B has not been functioning for a week. The room becomes unbearably hot during afternoon meetings. We have tried restarting the unit but it still does not cool properly.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        category: 'Facilities',
        userId: sarahId,
        aiAnalysis: JSON.stringify({
          category: 'Facilities',
          priority: 'HIGH',
          sentiment: 'NEUTRAL',
          suggestedAction: 'Dispatch maintenance team to inspect HVAC unit',
          keywords: ['ac', 'cooling', 'temperature', 'maintenance'],
        }),
      },
      {
        title: 'Payslip discrepancy for December salary',
        description: 'I noticed my December payslip shows an incorrect overtime amount. The actual overtime hours logged were 24 hours but the payslip only reflects 12 hours. I have attached my timesheet records for verification.',
        status: 'OPEN',
        priority: 'HIGH',
        category: 'HR / Payroll',
        userId: mikeId,
        aiAnalysis: JSON.stringify({
          category: 'HR / Payroll',
          priority: 'HIGH',
          sentiment: 'ANGRY',
          suggestedAction: 'Forward to HR/Payroll department for payslip review',
          keywords: ['payslip', 'salary', 'overtime', 'discrepancy'],
        }),
      },
      {
        title: 'Request for ergonomic chair replacement',
        description: 'My office chair has a broken back support and the hydraulic lift no longer holds. I would like to request a replacement ergonomic chair. I have been experiencing back pain due to the current chair condition.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        category: 'Facilities',
        userId: johnId,
        aiAnalysis: JSON.stringify({
          category: 'Facilities',
          priority: 'MEDIUM',
          sentiment: 'CALM',
          suggestedAction: 'Process furniture replacement request through procurement',
          keywords: ['chair', 'ergonomic', 'furniture', 'replacement'],
        }),
      },
    ];

    const ticketIds = [];
    for (const t of tickets) {
      const res = await client.query(`
        INSERT INTO tickets (title, description, status, priority, category, "userId", "aiAnalysis", "updatedAt", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW() - interval '${Math.floor(Math.random() * 7) + 1} days')
        RETURNING id, title, status, priority
      `, [t.title, t.description, t.status, t.priority, t.category, t.userId, t.aiAnalysis]);
      ticketIds.push(res.rows[0].id);
      console.log(`  ✅ [${res.rows[0].priority}] ${res.rows[0].title.substring(0, 50)}... → id: ${res.rows[0].id}`);
    }

    // =============================================
    // 3. MESSAGES (conversation threads on tickets)
    // =============================================
    console.log('\n💬 Creating messages...');

    const messages = [
      { content: 'This issue is affecting our entire floor. We need this fixed urgently as we have client presentations this week.', ticketId: ticketIds[0], senderId: johnId, ago: '2 days' },
      { content: 'We have escalated this to the networking team. A technician will be dispatched today to inspect the access points on Floor 3.', ticketId: ticketIds[0], senderId: adminId, ago: '1 day' },
      { content: 'Thank you for the quick response. Please update us once the technician has diagnosed the issue.', ticketId: ticketIds[0], senderId: johnId, ago: '1 day' },
      { content: 'We have logged this with the facilities management team. Maintenance is scheduled for tomorrow morning.', ticketId: ticketIds[1], senderId: adminId, ago: '3 days' },
      { content: 'In the meantime, could you book an alternative meeting room? Room 4A has working AC and is available.', ticketId: ticketIds[1], senderId: adminId, ago: '3 days' },
      { content: 'I have attached my December timesheet showing 24 overtime hours. Please cross-check with payroll records.', ticketId: ticketIds[2], senderId: mikeId, ago: '1 day' },
      { content: 'We have forwarded your case to the payroll department. They will review your timesheet and issue a correction if needed within 3 business days.', ticketId: ticketIds[2], senderId: adminId, ago: '12 hours' },
      { content: 'Could you please provide your desk location and employee ID so we can process the replacement request?', ticketId: ticketIds[3], senderId: adminId, ago: '5 days' },
      { content: 'My desk is B3-12 and employee ID is EMP-1042. Thank you for looking into this.', ticketId: ticketIds[3], senderId: johnId, ago: '4 days' },
      { content: 'Your new ergonomic chair has been ordered and will be delivered to your desk by Friday. Marking this ticket as resolved.', ticketId: ticketIds[3], senderId: adminId, ago: '2 days' },
    ];

    for (const m of messages) {
      const res = await client.query(`
        INSERT INTO messages (content, "ticketId", "senderId", "createdAt")
        VALUES ($1, $2, $3, NOW() - interval '${m.ago}')
        RETURNING id
      `, [m.content, m.ticketId, m.senderId]);
      console.log(`  ✅ Message #${res.rows[0].id} on ticket #${m.ticketId}`);
    }

    console.log('\n🎉 Seeding complete! Summary:');
    console.log(`   👤 ${users.length} users`);
    console.log(`   🎫 ${tickets.length} tickets`);
    console.log(`   💬 ${messages.length} messages`);
    console.log('\n📋 Login credentials:');
    for (const [loginId, password, , name, role] of users) {
      console.log(`   ${loginId} / ${password} → ${name} (${role})`);
    }

  } catch (err) {
    console.error('❌ Error seeding:', err);
  } finally {
    await client.end();
  }
}

main();
