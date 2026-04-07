describe('Initial flow', () => {
  it('redirects / to onboarding when onboarding is not complete', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.removeItem('feria_onboarding_complete');
      },
    });
    cy.url({ timeout: 10000 }).should('include', '/onboarding');
    cy.contains('FerIA');
  });

  it('redirects / to login when onboarding is complete and user is not signed in', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('feria_onboarding_complete', '1');
      },
    });
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.contains('FerIA');
  });
});
