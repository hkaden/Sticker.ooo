import React from 'react';

export const Nav00DataSource = {
  wrapper: { className: 'header0 home-page-wrapper' },
  page: { className: 'home-page' },
  logo: {
    className: 'header0-logo',
    children: '/static/images/logo.png',
  },
  Menu: {
    className: 'header0-menu',
    children: [
      { name: 'item0', a: { children: 'Nav Item 1', href: '' } },
      { name: 'item1', a: { children: 'Nav Item 2', href: '' } },
      { name: 'item2', a: { children: 'Nav Item 3', href: '' } },
      { name: 'item3', a: { children: 'Nav Item 4', href: '' } },
    ],
  },
  mobileMenu: { className: 'header0-mobile-menu' },
};
export const Banner00DataSource = {
  wrapper: { className: 'banner0' },
  textWrapper: { className: 'banner0-text-wrapper home-banner-area' },
  title: {
    className: 'banner0-title',
  },
  content: {
    className: 'banner0-content',
  },
  bannerImg: {
    className: 'img-fluid',
    style: { width: 300 },
    src: '/static/images/banner-img.png',
  },
  button: { className: 'banner0-button', children: 'Learn More' },
};
