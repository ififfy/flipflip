# Scene Generators
**Scene Generators** are a special kind of Scene that uses tag rules to generate a random list of sources from the Library.

Once you have at least 1 source and 1 tag in the Library, you can add a `Scene Generator` from the Scene Picker (Home). 
Scene Generators appear in their own tab in the Scene Picker.

![](doc_images/scene_detail_generator.png)

## Make Rules

### Simple Rules
To get started, click the `+` and select a Tag to create a **Simple Rule**.

A simple rule can function in 1 of 3 ways:
#### Percent
This will be the most commonly used option. The percent value (modified with the slider) denotes what percentage of the 
total should have the specified tag.

#### Require
This rule means that all sources _must have_ the specified tag.

#### Exclude
This rule means that all sources _must **not** have_ the specified tag.

### Adv Rule
An advanced rule is just a combination of simple rules, which can also be given a **percent**, **require**, or **exclude**.
e.g. You could make a advanced rule made up of 2 simple rules: **require** <Tag1> and **require** <Tag2>. You could then
give this advanced rule a percent of 50. 50% of your generated sources will now have both of these tags!

## Generate Scene
You can't generate a Scene until **all 100%** is allocated between rules. You will see the remaining percent above the
Generate button until your rules are valid. 

Once your rules are valid, click the `Generate` button ( <img style="vertical-align: -5px" src="doc_icons/generate.svg" 
alt="Generate" width="20" height="20"> ). This will use the rules you set up to generate a random selection of sources 
for your Scene. The default max number of sources is 200, but you can lower or raise this to meet your needs.

After generating a scene, you will see a number (`X/Y`) next to each Percent rule. This tells you how many sources 
were chosen during generation from the total that fit your rules. This can help in finding a optimal MAX number for your
specific rules.

Any changes to Effects here will be persisted between generated Scenes (using this Generator). The only thing that 
gets overridden when you click `Generate` is the list of sources. If you are particularly fond of a generated 
Scene, you can click `Save as Scene` in the sidebar to save these sources as their own stand-alone Scene.