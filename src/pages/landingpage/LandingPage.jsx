import React from "react";
import LPHome from "./components/LPHome";
import LPAbout from "./components/LPAbout";
import LPContact from "./components/LPContact";

export default function () {
  return (
    <div >
      <main >
        {/*Home*/}
        <section>
          <div>
            <LPHome />
          </div>
        </section>

        {/*About*/}
        <section>
          <LPAbout />
        </section>

        {/*Contact*/}
        <section>
          <LPContact />
        </section>
      </main>
    </div>
  );
}
