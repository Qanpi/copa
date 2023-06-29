import "./header.css"

function Header() {
    return (
        <header>
            <div class="settings-bar">
                <span>Eng</span>
                <span> | </span>
                <span> Dark </span>
            </div>
            <div class="bottom-bar">
                <div class="logo">

                </div>
                <div class="links">
                    <span>Home</span>
                    <span>Statistics</span>
                    <span>All-time</span>
                    <span>Fantasy</span>
                    <span>About</span>
                </div>
                <span class="sign-in">Sign in</span>
            </div>
        </header>
    )
}

export default Header;  