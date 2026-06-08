process.env.META_VERIFY_TOKEN ||= "test";
process.env.META_PAGE_ACCESS_TOKEN ||= "test";

const { renderInvite } = await import("../src/invite-template.js");

const html = renderInvite({
  psid: "demo-psid",
  firstName: "Nguyen",
  lastName: "An",
  profilePic: ""
});

if (!html.includes("Nguyen An") || !html.includes("Tran trong kinh moi")) {
  throw new Error("Invite template did not render expected content");
}

console.log("render ok");
