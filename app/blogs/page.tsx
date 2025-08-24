"use client";
import React from "react";
import NavigationBar from "../navbar";
import BlogList from "../blog-list";
import { blogs } from "../blog-data";

export default function BlogsPage() {
  return (
    <>
      <NavigationBar />
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Our Products</h1>
        <BlogList blogs={blogs} />
      </main>
    </>
  );
}
