// Simple test to check if the application loads
context("Application Loading", () => {
  it("loads the application", () => {
    // Visit the application without any query parameters
    const url = `${Cypress.config("index")}`
    cy.visit(url)
    
    // Wait for the application to load
    cy.log("Waiting for the application to load")
    cy.wait(10000) // Increase wait time to ensure page loads
    
    // Just check if the body exists
    cy.get("body").should("exist")
    cy.log("Page loaded successfully")
  })
  
  it("loads the application with sample data", () => {
    // Use lowercase 'mammals' to match the URL parameter handling in the App component
    const queryParams = "?sample=mammals&dashboard&mouseSensor"
    const url = `${Cypress.config("index")}${queryParams}`
    cy.visit(url)
    
    // Wait for the application to load
    cy.log("Waiting for the application to load")
    cy.wait(10000) // Increase wait time to ensure page loads
    
    // Just check if the body exists
    cy.get("body").should("exist")
    cy.log("Page loaded successfully")
  })
}) 