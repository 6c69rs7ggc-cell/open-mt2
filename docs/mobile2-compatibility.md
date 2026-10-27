# Mobile2 client compatibility assessment

## Evidence collected

The supplied Mobile2Global folder contains an Unreal Engine-style layout:

- `Engine/Content/Paks/pakchunk0-WindowsNoEditor.pak` (36,675,915 bytes).
- Several `pakchunk*-WindowsNoEditor.sig` signature files, but only one corresponding `.pak` file was present in the file listing.
- CEF3 runtime files and language `.pak` files under `Engine/Binaries/ThirdParty/CEF3/Win64/Resources`; these are Chromium Embedded Framework resources, not evidence of Metin2 world assets.
- The reported executable `mobilemmo-Win64-Shipping.exe` contains strings referencing Unreal Engine 4.27 and Metin2-style data names such as `item_proto`, `mob_proto`, `skill_proto`, `m2data/warriorData.txt`, and a `.gr2` model name.

The PAK trailer appears to contain the Unreal PAK magic bytes. Its file index has not been successfully parsed or verified. No actual item/mob tables, model files, textures, or map assets have been confirmed as extracted from the supplied package.

## Compatibility conclusion

Mobile2 is useful as a *reference for investigation*, but it is not currently a drop-in client or asset source for this Metin2 server:

- Unreal Engine PAK data cannot be copied directly into the classic Metin2 client.
- Unreal Engine runtime DLLs do not replace the classic client's Granny2 runtime.
- Names embedded in an executable only show that the program references those names; they do not prove the corresponding data files are available.
- The current server's data is maintained in its own formats under `src/core/infra/config/data/`, including `items.json` and `mobs.json`.

## Safe next steps

1. Continue server development independently of Mobile2.
2. If readable, lawfully usable exports of Mobile2's item/mob/skill tables become available, compare their schema and identifiers with the server's JSON data before importing anything.
3. Treat models, maps, textures, sounds, and client binaries as unavailable until their actual files, format, and redistribution rights are confirmed.
4. Keep the Windows client release disabled until a matching, complete runtime and game-data folder is available and the real client login path has been tested.

Do not mark Mobile2 asset reuse or classic-client compatibility as complete based only on executable strings or PAK signatures.
