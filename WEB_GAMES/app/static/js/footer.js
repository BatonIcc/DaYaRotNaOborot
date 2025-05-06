function footer() {
    const
        main = document.getElementById('main_content'),
        footer = document.getElementsByTagName('footer')[0],
        html = document.getElementsByTagName('html')[0],
        body = document.getElementsByTagName('body')[0],
        pageHeight = document.documentElement.clientHeight

    let height = pageHeight - footer.offsetHeight - main.clientHeight;
    height = height < 60 ? 60 : height;
    main.style.paddingBottom = height + 'px';
}

window.addEventListener('load', footer);
window.addEventListener('resize', footer);