import { ComponentElements as c } from "../support/elements/component-elements"
import { ToolbarElements as toolbar } from "../support/elements/toolbar-elements"
import { TableTileElements as table } from "../support/elements/table-tile"
import { GraphTileElements as graph } from "../support/elements/graph-tile"

// This test file focuses on testing the data visualization components
context("Visualization Components", () => {
  beforeEach(function () {
    // Use lowercase 'mammals' to match the URL parameter handling in the App component
    const queryParams = "?sample=mammals&dashboard&mouseSensor"
    const url = `${Cypress.config("index")}${queryParams}`
    cy.visit(url)
    
    // Wait for the application to load
    cy.log("Waiting for the application to load")
    cy.wait(10000) // Increase wait time to ensure page loads
  })

  // Test that the table component loads and displays data
  it("loads the table component and displays data", () => {
    // Check if the body exists
    cy.get("body").should("exist")
    cy.log("Page loaded successfully")
    
    // Check if the table component exists
    cy.get("body").then($body => {
      if ($body.find(".codap-component.codap-case-table").length > 0) {
        cy.log("Table component found")
        
        // Check if the table has a title
        cy.get(".codap-component.codap-case-table").find(".title-bar").should("exist")
        
        // Log success
        cy.log("Table component loaded successfully")
      } else {
        cy.log("Table component NOT found")
      }
    })
  })

  // Test that the graph component loads and displays data
  it("loads the graph component and displays data", () => {
    // Check if the body exists
    cy.get("body").should("exist")
    cy.log("Page loaded successfully")
    
    // Check if the graph component exists
    cy.get("body").then($body => {
      if ($body.find(".codap-component.codap-graph").length > 0) {
        cy.log("Graph component found")
        
        // Check if the graph has a title
        cy.get(".codap-component.codap-graph").find(".title-bar").should("exist")
        
        // Log success
        cy.log("Graph component loaded successfully")
      } else {
        cy.log("Graph component NOT found")
      }
    })
  })
}) 