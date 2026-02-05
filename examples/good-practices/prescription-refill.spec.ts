// Example: Good Playwright Test Following Best Practices
import { test, expect } from '@playwright/test';
import { PrescriptionSearchPage } from '../page-objects/pharmacy/PrescriptionSearchPage';
import { createTestPrescription, deleteTestPrescription } from '../utils/pharmacy/prescription-helpers';

test.describe('Prescription Refill Flow', () => {
  let prescriptionId: string;

  test.beforeEach(async ({ page }) => {
    // Create test data
    const prescription = await createTestPrescription(page, {
      medication: 'Lisinopril 10mg',
      dosage: '10mg',
      refillsRemaining: 3,
    });
    prescriptionId = prescription.id;
  });

  test.afterEach(async ({ page }) => {
    // Cleanup test data
    await deleteTestPrescription(page, prescriptionId);
  });

  test('should allow user to refill prescription with remaining refills', async ({ page }) => {
    // Arrange - Set up page object
    const searchPage = new PrescriptionSearchPage(page);
    await searchPage.navigate();

    // Act - Perform user actions
    await searchPage.searchById(prescriptionId);
    
    // Assert - Verify refill button is available
    const refillButton = searchPage.getRefillButton(prescriptionId);
    await expect(refillButton).toBeEnabled();
    
    // Act - Click refill
    await refillButton.click();

    // Assert - Verify modal appears
    const modal = page.getByRole('dialog', { name: 'Confirm Refill' });
    await expect(modal).toBeVisible();

    // Act - Confirm refill
    await modal.getByRole('button', { name: 'Confirm' }).click();

    // Assert - Verify success message
    await expect(page.getByRole('alert')).toHaveText('Refill requested successfully');
    await expect(page).toHaveURL(/.*success/);
  });

  test('should display refills remaining count', async ({ page }) => {
    const searchPage = new PrescriptionSearchPage(page);
    await searchPage.navigate();
    await searchPage.searchById(prescriptionId);

    const prescriptionCard = searchPage.getResultCard(prescriptionId);
    await expect(prescriptionCard).toContainText('Refills remaining: 3');
  });

  test('should prevent refill when prescription is cancelled', async ({ page }) => {
    // Cancel the prescription first
    await page.request.patch(`/api/prescriptions/${prescriptionId}`, {
      data: { status: 'cancelled' },
    });

    const searchPage = new PrescriptionSearchPage(page);
    await searchPage.navigate();
    await searchPage.searchById(prescriptionId);

    // Verify refill button is disabled
    const refillButton = searchPage.getRefillButton(prescriptionId);
    await expect(refillButton).toBeDisabled();
    
    // Verify helpful message
    const prescriptionCard = searchPage.getResultCard(prescriptionId);
    await expect(prescriptionCard).toContainText('This prescription has been cancelled');
  });
});

/**
 * Why this is a good example:
 * 
 * ✅ Uses page objects (PrescriptionSearchPage)
 * ✅ Uses utility functions (createTestPrescription, deleteTestPrescription)
 * ✅ Proper test isolation (beforeEach/afterEach)
 * ✅ Descriptive test names
 * ✅ Accessible selectors (getByRole, getByLabel)
 * ✅ Proper assertions (toBeVisible, toHaveText, toBeEnabled)
 * ✅ No hard-coded waits
 * ✅ Clear Arrange-Act-Assert pattern
 * ✅ Tests business logic (refills remaining, cancelled status)
 * ✅ Organized in describe blocks
 * ✅ Proper cleanup
 */
