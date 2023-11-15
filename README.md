# double-underscore

Legacy of https://code.google.com/archive/p/double-underscore/

> a light-weight javascript library with widgets

## double-underscore means '__'
__ is the only global namespace used by this library.

## why there is another library?

- All most all javascript library do things such as array utilities, string utilities, DOM, Event, Animation, Drag & Drop, widgets, browser compatibilities, layout management, standard components ... If we do NOT used a library, we had to cope with those thing ourselves, we lost our __development efficiency__. If we use a library, generally we had to load a big extra library file, we lost __executive efficiency__.
- `double-underscore` tries to solves those problems. `double-underscore` is NOT a all in one library, it only cope with things we are most probably faced with in daily web development. And it used a uncoupling structure which means you could always optimize your loading size by easily remove those unused parts.