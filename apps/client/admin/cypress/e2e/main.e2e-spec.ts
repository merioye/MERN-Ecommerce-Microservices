describe('E2E Test', () => {
  it('should visit', () => {
    cy.visit('/');
    expect(true).to.be.true;
  });
});
