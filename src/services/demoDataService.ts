import { addClient } from './clientService';
import { addProject } from './projectService';
import { addPayment } from './paymentService';

export const seedSampleData = async (userId: string) => {
  try {
    // 1. Add Clients
    const client1 = await addClient(userId, {
      name: 'Sarah Jenkins',
      company: 'Apex Brand Labs',
      phone: '+880 1711 987654',
      email: 'sarah@apexbrand.com',
      notes: 'Key client for quarterly branding updates and marketing assets.'
    });

    const client2 = await addClient(userId, {
      name: 'Rahim Chowdhury',
      company: 'Nova Digital Ltd.',
      phone: '+880 1819 123456',
      email: 'rahim@novadigital.bd',
      notes: 'Website UI/UX design project with ongoing maintenance contract.'
    });

    const client3 = await addClient(userId, {
      name: 'Elena Rostova',
      company: 'Veloce Apparel',
      phone: '+1 415 555 0192',
      email: 'elena@veloce.style',
      notes: 'E-commerce brand Identity & merchandise package.'
    });

    // 2. Add Projects & Payments for Client 1
    const p1 = await addProject(userId, {
      clientId: client1.id,
      clientName: client1.name,
      projectName: 'Complete Brand Identity Refresh',
      service: 'Logo & Brand Guidelines',
      totalPrice: 20000,
      createdDate: '2026-07-01'
    });

    await addPayment(userId, p1.id, client1.id, p1.totalPrice, 5000, '2026-07-02', 'Initial 25% Deposit');
    await addPayment(userId, p1.id, client1.id, p1.totalPrice, 8000, '2026-07-15', 'Milestone 2 - First Concepts Approved');

    // 3. Add Project & Payments for Client 2
    const p2 = await addProject(userId, {
      clientId: client2.id,
      clientName: client2.name,
      projectName: 'Mobile App UI/UX Redesign',
      service: 'Figma UI/UX & Design System',
      totalPrice: 35000,
      createdDate: '2026-07-10'
    });

    await addPayment(userId, p2.id, client2.id, p2.totalPrice, 15000, '2026-07-12', 'Upfront retainer');

    // 4. Add Project & Payments for Client 3
    const p3 = await addProject(userId, {
      clientId: client3.id,
      clientName: client3.name,
      projectName: 'Summer Collection Packaging Design',
      service: 'Packaging & Apparel Labels',
      totalPrice: 12000,
      createdDate: '2026-06-15'
    });

    await addPayment(userId, p3.id, client3.id, p3.totalPrice, 6000, '2026-06-16', '50% Upfront');
    await addPayment(userId, p3.id, client3.id, p3.totalPrice, 6000, '2026-07-05', 'Final balance upon print file delivery');

    return true;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return false;
  }
};
