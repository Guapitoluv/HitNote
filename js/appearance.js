export function changeTheme(theme) {
    switch (theme) {
        case "default":
            changeThemeToDefault();
            break;
        
        case "light_milk":
            changeThemeToLightMilk();
            break;
        
        case "wood": document.body.dataset.theme="wood"; break;
    }
}


function changeThemeToDefault() {
    document.body.dataset.theme="default";
}

function changeThemeToLightMilk() {
    document.body.dataset.theme="light-milk";
}