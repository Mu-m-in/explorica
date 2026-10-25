// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  const navbar = document.querySelector('.navbar')
  const menuButton = document.querySelector('.navbar-toggler')
  const drawer = document.querySelector('.navbar-collapse')
  const closeButton = document.querySelector('.drawer-close')
  const backdrop = document.querySelector('.nav-backdrop')

  const setDrawerOpen = (isOpen) => {
    if (!navbar || !menuButton || !drawer || !backdrop) return

    navbar.classList.toggle('is-drawer-open', isOpen)
    backdrop.classList.toggle('is-visible', isOpen)
    document.body.classList.toggle('nav-drawer-open', isOpen)
    menuButton.setAttribute('aria-expanded', String(isOpen))
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu')
  }

  menuButton?.addEventListener('click', () => {
    setDrawerOpen(menuButton.getAttribute('aria-expanded') !== 'true')
  })
  closeButton?.addEventListener('click', () => setDrawerOpen(false))
  backdrop?.addEventListener('click', () => setDrawerOpen(false))
  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setDrawerOpen(false))
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setDrawerOpen(false)
  })
  window.matchMedia('(min-width: 992px)').addEventListener('change', event => {
    if (event.matches) setDrawerOpen(false)
  })

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()
