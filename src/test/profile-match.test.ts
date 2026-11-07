import { describe, it, expect } from 'vitest';
import { buildProfileTerms, scoreJobAgainstProfile, PROFILE_MATCH_THRESHOLD } from '@/jobstudio/utils/profileMatch';

const profile = buildProfileTerms('Senior Product Manager. Led AI product roadmap, analytics, SQL, stakeholder management.');

describe('profile matching', () => {
  it('keeps a role whose title matches the profile', () => {
    expect(scoreJobAgainstProfile({ title: 'Senior Product Manager, AI' }, profile)).toBeGreaterThanOrEqual(PROFILE_MATCH_THRESHOLD);
  });
  it('drops an unrelated role', () => {
    expect(scoreJobAgainstProfile({ title: 'Mechanical Welder' }, profile)).toBeLessThan(PROFILE_MATCH_THRESHOLD);
  });
  it('scores 0 with an empty profile', () => {
    expect(scoreJobAgainstProfile({ title: 'Product Manager' }, buildProfileTerms(''))).toBe(0);
  });
  const travelProfile = buildProfileTerms('Operations Manager. Business development in travel tourism. Travel consultant, bookings, customer support, sales, stakeholder management, analytics, business systems and process improvement.');
  for (const title of ['AI Engineer', 'Application Engineer', 'Backend Software Engineer']) {
    it(`excludes ${title} for a travel operations profile despite shared business words`, () => {
      expect(scoreJobAgainstProfile({ title, descriptionSnippet: 'business operations analytics stakeholder management process improvement customer support' }, travelProfile)).toBeLessThan(40);
    });
  }
  for (const title of ['Travel Operations Manager', 'Tourism Business Development Manager', 'Operations Manager']) {
    it(`retains ${title} for the travel operations profile`, () => {
      expect(scoreJobAgainstProfile({ title, descriptionSnippet: 'travel tourism bookings sales customer support business development operations' }, travelProfile)).toBeGreaterThanOrEqual(40);
    });
  }
  it('retains engineering roles for an engineering profile', () => {
    const engineeringProfile = buildProfileTerms('AI Engineer, software development, Python machine learning, analytics, business operations.');
    expect(scoreJobAgainstProfile({ title: 'AI Engineer', descriptionSnippet: 'Python machine learning software development' }, engineeringProfile)).toBeGreaterThanOrEqual(40);
  });

  describe('Amarjith P K (Mechanical Engineer profile)', () => {
    const amarjithProfileText = `
AMARJITH P K
MECHANICAL ENGINEER
Location: Vadakara, Calicut, Kerala, India
Education: BE Mechanical, Annamalai University (2008-2012)
Skills: Public Relations, Teamwork, Time Management, Leadership, Effective Communication, Critical Thinking

Work Experience:
Autoscan India Pvt Ltd (JCB INDIA LTD), Sep 2025 - Present
Service Manager
- Troubleshooting of JCB Excavators, Mini Excavators and Wheel Loaders
- Making detailed failure reports of machines
- Understanding Customer issues and providing technical solutions

Shrivenkatesha Heavy Equipments (HYUNDAI HEAVY MACHINERY DEALER, KERALA), Sep 2024 - Sep 2025
Area Service Manager
- Ensure quality service and resolve customer issues and complaints
- Monitor training needs service engineers and ensure they are performing their activities properly
- Achieve monthly targets with proper planning and execution of ideas

Kadoor Sales Corporation (JCB DEALER, NORTH KERALA), Feb 2019 - Sep 2024
Service Incharge
- Understanding customer needs and providing service solutions
- Creating strategies to enhance customer experience and meet service objectives
- Analysing customer feedback and service metrics to identify areas of improvement
- Making plans to achieve targets on time

Creative Engineers (MINING MACHINERY MANUFACTURER, BANGALORE), Jan 2014 - Mar 2017
Production Engineer
- Vendor selection and vendor management
- Cost estimation
- Handling the workforce
- Experienced in Erection and Commissioning of Mining Machineries
`;
    const amarjithTerms = buildProfileTerms(amarjithProfileText);

    it('strictly drops Sales Manager – India even though Kadoor Sales Corporation contains sales', () => {
      expect(scoreJobAgainstProfile({ title: 'Sales Manager – India', rawDescription: 'Achieve monthly targets, lead sales calls, manage customer relationships across India.' }, amarjithTerms)).toBe(0);
    });

    it('strictly drops SAP Consultant / Developer roles', () => {
      expect(scoreJobAgainstProfile({ title: 'SAP Consultant', rawDescription: 'Configure SAP S/4HANA modules and business process integrations.' }, amarjithTerms)).toBe(0);
      expect(scoreJobAgainstProfile({ title: 'SAP Technical Lead', rawDescription: 'ABAP programming, SAP Fiori, integration architecture.' }, amarjithTerms)).toBe(0);
    });

    it('strictly drops Software Developer roles (Mechanical Engineer has no coding background)', () => {
      expect(scoreJobAgainstProfile({ title: 'Backend Software Engineer', rawDescription: 'Build scalable APIs using Python, React, and Kubernetes.' }, amarjithTerms)).toBe(0);
      expect(scoreJobAgainstProfile({ title: 'Frontend Developer', rawDescription: 'Develop modern web UI using TypeScript and React.' }, amarjithTerms)).toBe(0);
      expect(scoreJobAgainstProfile({ title: 'Full Stack Engineer', rawDescription: 'Full stack development with Node.js and PostgreSQL.' }, amarjithTerms)).toBe(0);
    });

    it('strictly drops Data Analyst and Benefits Analyst roles', () => {
      expect(scoreJobAgainstProfile({ title: 'Data Analyst', rawDescription: 'Analyze business metrics using SQL and Python dashboards.' }, amarjithTerms)).toBe(0);
      expect(scoreJobAgainstProfile({ title: 'Benefits Analyst', rawDescription: 'Oversee corporate healthcare benefits, employee wellness, and payroll compliance.' }, amarjithTerms)).toBe(0);
    });

    it('matches authentic Mechanical, Equipment Service, and Production Engineering roles', () => {
      expect(scoreJobAgainstProfile({
        title: 'Mechanical Engineer',
        rawDescription: 'Oversee mechanical systems, equipment maintenance, engineering failure reports, troubleshooting, and plant operations.'
      }, amarjithTerms)).toBeGreaterThanOrEqual(45);

      expect(scoreJobAgainstProfile({
        title: 'Production Engineer',
        rawDescription: 'Production engineering, vendor management, machine erection and commissioning, workforce planning.'
      }, amarjithTerms)).toBeGreaterThanOrEqual(45);

      expect(scoreJobAgainstProfile({
        title: 'Service Planning Manager',
        rawDescription: 'Lead service operations, engineer training, technical customer troubleshooting, machine failure analysis, and service metrics.'
      }, amarjithTerms)).toBeGreaterThanOrEqual(45);
    });
  });
});
