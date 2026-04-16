import { Link } from "react-router-dom";
import logo from "../assets/recipe-vault-logo.png";
import "./HomePage.css";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Meal Planning Made Simple</span>
          <h1 className="home-title">Plan smarter with RecipeVault</h1>
          <p className="home-subtitle">
            Discover recipes, build personalized weekly meal plans, organize ingredients, and export recipe PDFs - all in one place!
          </p>

          <div className="home-actions">
            <Link to="/recipes" className="home-primary-button">
              Browse Recipes
            </Link>
            <Link to="/weekly-menu" className="home-secondary-button">
              Build Weekly Menu
            </Link>
          </div>
        </div>

        <div className="home-hero-card">
          <img
            src={logo}
            alt="RecipeVault logo"
            className="home-hero-logo"
          />
          <div className="home-hero-card-content">
            <h2>Your weekly cooking companion</h2>
            <p>
              Search by recipe or ingredient, save favorites, and generate meal plans that fit your week.
            </p>
          </div>
        </div>
      </div>

      <div className="home-feature-grid">
        <article className="home-feature-card">
          <h3>Search Recipes</h3>
          <p>
            Find recipes by name or ingredient to quickly discover meals that fit what you have on hand.
          </p>
        </article>

        <article className="home-feature-card">
          <h3>Build Weekly Menus</h3>
          <p>
            Generate multi-day meal plans with breakfast, lunch, and dinner ideas in seconds.
          </p>
        </article>

        <article className="home-feature-card">
          <h3>Export PDFs</h3>
          <p>
            Download full weekly meal plans or individual recipe PDFs for easy cooking and shopping.
          </p>
        </article>

        <article className="home-feature-card">
          <h3>Save Favorites</h3>
          <p>
            Keep your go-to recipes close and generate meal plans from favorites only.
          </p>
        </article>
      </div>

      <div className="home-steps">
        <div className="section-heading">
          <h2>How it works</h2>
          <p>From recipe discovery to meal prep, RecipeVault keeps it simple.</p>
        </div>
      
        <div className="home-step-grid">
          <article className="home-step-card">
            <span className="step-badge">1</span>
            <h3>Explore recipes</h3>
            <p>Browse your recipe library and search by name or ingredient.</p>
          </article>
          
          <article className="home-step-card">
            <span className="step-badge">2</span>
            <h3>Generate a plan</h3>
            <p>
              Pick a start date and build a weekly menu tailored to your needs.
            </p>
          </article>

          <article className="home-step-card">
            <span className="step-badge">3</span>
            <h3>Cook with confidence</h3>
            <p>
              Review ingredient summaries and download recipe or menu PDFs.
            </p>
          </article>
        </div>
      </div>

      <div className="home-cta">
        <div>
          <h2>Ready to plan your next week?</h2>
          <p>
            Start with your recipe library or jump straight into meal planning.
          </p>
        </div>

        <div className="home-actions">
          <Link to="/recipes" className="home-primary-button">
            View Recipes
          </Link>
          <Link to="/weekly-menu" className="home-secondary-button">
            Open Weekly Menu
          </Link>
        </div>
      </div>
    </section>
  );
}