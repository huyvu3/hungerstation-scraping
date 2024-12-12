# Project Setup and Execution Guide

## Prerequisites
- Node.js installed (recommended version: 20.x or later)
- npm (Node Package Manager)

## Installation

1. Install dependencies:
```bash
npm i
```

## Running the Project

Execute the following scripts in sequence:

2. Crawl Cuisine Data:
```bash
node crawl-cuisine.js
```
This script will crawl and collect all cuisine information.

3. Crawl Restaurant Details:
```bash
node crawl-restaurant.js
```
This script will retrieve detailed information about restaurants.

4. Run Main Application:
```bash
node crawl-product.js
```
This is the main script that processes the collected product data and export file csv.

## Execution Order
It's crucial to run the scripts in the following order:
1. `npm i`
2. `node crawl-cuisine.js`
3. `node crawl-restaurant.js`
4. `node crawl-product.js`

## Troubleshooting
- Ensure all dependencies are correctly installed
- Check that you have the latest version of Node.js
- Verify network connectivity for web scraping scripts
- Make sure you have necessary permissions to run the scripts