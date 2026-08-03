/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { usePageMeta } from '../hooks/usePageMeta';
import { AGPL_LICENSE_URL } from '../constants/repo';

export const Legal = () => {
	usePageMeta({
		path: '/legal',
		title: 'Legal Information',
		description:
			'License, terms of use, and privacy policy for the Miata Registry.',
	});

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto py-8 text-sm">
				<div className="prose prose-h1:text-brg prose-h2:text-brg prose-h3:text-brg prose-h4:text-brg prose-h5:text-brg prose-h6:text-brg prose-p:text-brg prose-p:my-2 prose-a:text-brg prose-a:underline prose-a:hover:text-brg-mid prose-a:hover:underline prose-strong:text-brg prose-ul:text-brg prose-ol:text-brg prose-li:text-brg prose-li:list-disc prose-li:ml-4  prose-li:my-2 prose-li:marker:text-brg-mid prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-4 prose-hr:mt-8 prose-hr:mb-4 max-w-none">
					<h1>Legal Information</h1>

					<section>
						<h2>License</h2>
						<p>
							Miata Registry is licensed under the GNU Affero
							General Public License v3.0 (AGPL-3.0). This means
							the software and dataset is free to use, modify, and
							distribute, but any modifications must also be made
							available under the same license terms.
						</p>
						<a
							href={AGPL_LICENSE_URL}
							target="_blank"
							rel="noopener noreferrer"
						>
							Read the full AGPL-3.0 license
						</a>
					</section>

					<section>
						<h2>Trademark Notice</h2>
						<p>
							Mazda, Miata, MX-5, and all related marks are
							trademarks of Mazda Motor Corporation. This project
							is not affiliated with, endorsed by, or connected to
							Mazda Motor Corporation.
						</p>
					</section>

					<hr />

					<section>
						<h2>Terms of Use</h2>

						<p>Last updated: July 27, 2026</p>
						<p>
							These Terms of Use govern Your access to and use of
							the Miata Registry (the &quot;Service&quot;). By
							accessing or using the Service, You agree to be
							bound by these Terms. If You do not agree, do not
							use the Service. In these Terms, &quot;We&quot;,
							&quot;Us&quot; and &quot;Our&quot; refer to Miata
							Registry.
						</p>
						<h3>The Service</h3>
						<p>
							The Service is a free, community-maintained registry
							of limited edition Mazda Miatas. The information in
							the registry is largely submitted by members of the
							community, and while submissions are reviewed by
							moderators before publication, We do not guarantee
							the accuracy, completeness, or availability of the
							Service or of any information it contains.
						</p>
						<h3>Accounts</h3>
						<p>
							You must provide accurate information when creating
							an account and are responsible for all activity that
							occurs under it. We may suspend or terminate
							accounts that violate these Terms.
						</p>
						<h3>Your Submissions</h3>
						<p>
							You retain ownership of the content You submit to
							the Service, including photos, car histories, and
							ownership details. By submitting content, You:
						</p>
						<ul>
							<li>
								grant Us a worldwide, non-exclusive,
								royalty-free, perpetual, irrevocable license to
								host, reproduce, display, and distribute that
								content as part of the Service and its open
								dataset, including distribution under the
								AGPL-3.0 license and archival with third parties
								such as the Internet Archive; and
							</li>
							<li>
								represent that You have the necessary rights to
								submit the content and that it is accurate to
								the best of Your knowledge.
							</li>
						</ul>
						<p>
							All submissions are subject to moderation. We may
							edit, reject, or remove any submission at Our sole
							discretion.
						</p>
						<h3>Acceptable Use</h3>
						<p>You agree not to:</p>
						<ul>
							<li>
								submit false, misleading, or infringing content;
							</li>
							<li>use the Service for any unlawful purpose;</li>
							<li>
								interfere with or disrupt the operation of the
								Service; or
							</li>
							<li>
								collect personal information about other users
								except as made available through the Service's
								public registry and open dataset.
							</li>
						</ul>
						<h3>
							Disclaimer of Warranties; Limitation of Liability
						</h3>
						<p>
							The Service is provided &quot;as is&quot; and
							&quot;as available&quot;, without warranties of any
							kind, express or implied, including warranties of
							merchantability, fitness for a particular purpose,
							and non-infringement. To the maximum extent
							permitted by law, We will not be liable for any
							indirect, incidental, special, consequential, or
							punitive damages arising out of Your use of the
							Service, and Our total liability for any claim will
							not exceed the amount You have paid Us to use the
							Service (which is zero).
						</p>
						<h3>Governing Law</h3>
						<p>
							These Terms are governed by the laws of the State of
							Texas, United States, without regard to its conflict
							of law provisions.
						</p>
						<h3>Changes to These Terms</h3>
						<p>
							We may update these Terms from time to time by
							posting the revised Terms on this page and updating
							the &quot;Last updated&quot; date above. Your
							continued use of the Service after changes are
							posted constitutes acceptance of the revised Terms.
						</p>
					</section>

					<hr />

					<section>
						<h2>Privacy Policy</h2>

						<p>Last updated: July 27, 2026</p>
						<p>
							This Privacy Policy describes Our policies and
							procedures on the collection, use and disclosure of
							Your information when You use the Service and tells
							You about Your privacy rights and how the law
							protects You.
						</p>
						<p>
							We use Your Personal data to provide and improve the
							Service. By using the Service, You agree to the
							collection and use of information in accordance with
							this Privacy Policy.
						</p>
						<h2>Interpretation and Definitions</h2>
						<h3>Interpretation</h3>
						<p>
							The words of which the initial letter is capitalized
							have meanings defined under the following
							conditions. The following definitions shall have the
							same meaning regardless of whether they appear in
							singular or in plural.
						</p>
						<h3>Definitions</h3>
						<p>For the purposes of this Privacy Policy:</p>
						<ul>
							<li>
								<p>
									<strong>Account</strong> means a unique
									account created for You to access our
									Service or parts of our Service.
								</p>
							</li>
							<li>
								<p>
									<strong>Cookies</strong> are small files
									that are placed on Your computer, mobile
									device or any other device by a website,
									containing the details of Your browsing
									history on that website among its many uses.
								</p>
							</li>
							<li>
								<p>
									<strong>Country</strong> refers to: Texas,
									United States
								</p>
							</li>
							<li>
								<p>
									<strong>Device</strong> means any device
									that can access the Service such as a
									computer, a cellphone or a digital tablet.
								</p>
							</li>
							<li>
								<p>
									<strong>Personal Data</strong> is any
									information that relates to an identified or
									identifiable individual.
								</p>
							</li>
							<li>
								<p>
									<strong>Service</strong> refers to the
									Website.
								</p>
							</li>
							<li>
								<p>
									<strong>Service Provider</strong> means any
									natural or legal person who processes the
									data on Our behalf. It refers to third-party
									companies or individuals employed by Us to
									facilitate the Service, to provide the
									Service on Our behalf, to perform services
									related to the Service or to assist Us in
									analyzing how the Service is used.
								</p>
							</li>
							<li>
								<p>
									<strong>Usage Data</strong> refers to data
									collected automatically, either generated by
									the use of the Service or from the Service
									infrastructure itself (for example, the
									duration of a page visit).
								</p>
							</li>
							<li>
								<p>
									<strong>We</strong>, <strong>Us</strong> or{' '}
									<strong>Our</strong> refers to Miata
									Registry.
								</p>
							</li>
							<li>
								<p>
									<strong>Website</strong> refers to Miata
									Registry, accessible from{' '}
									<a
										href="https://miataregistry.com"
										rel="external nofollow noopener"
										target="_blank"
									>
										https://miataregistry.com
									</a>
								</p>
							</li>
							<li>
								<p>
									<strong>You</strong> means the individual
									accessing or using the Service, or the
									company, or other legal entity on behalf of
									which such individual is accessing or using
									the Service, as applicable.
								</p>
							</li>
						</ul>
						<h2>Collecting and Using Your Personal Data</h2>
						<h3>Types of Data Collected</h3>
						<h4>Personal Data</h4>
						<p>
							While using Our Service, We may ask You to provide
							Us with certain personally identifiable information
							that can be used to contact or identify You.
							Personally identifiable information may include, but
							is not limited to:
						</p>
						<ul>
							<li>
								<p>Email address</p>
							</li>
							<li>
								<p>First name and last name</p>
							</li>
							<li>
								<p>City, State or Province, and Country</p>
							</li>
							<li>
								<p>Social media links You choose to share</p>
							</li>
							<li>
								<p>
									Information about Your vehicle, including
									its VIN and ownership history
								</p>
							</li>
							<li>
								<p>Usage Data</p>
							</li>
						</ul>
						<h4>Usage Data</h4>
						<p>
							Usage Data is collected automatically when using the
							Service, primarily by Our hosting provider,
							Cloudflare, as part of the network traffic logs it
							keeps in order to operate and secure the Service.
						</p>
						<p>
							Usage Data may include information such as Your
							Device's Internet Protocol address (e.g. IP
							address), browser type, browser version, the pages
							of our Service that You visit, the time and date of
							Your visit, the time spent on those pages, unique
							device identifiers and other diagnostic data.
						</p>
						<p>
							When You access the Service by or through a mobile
							device, We may collect certain information
							automatically, including, but not limited to, the
							type of mobile device You use, Your mobile device
							unique ID, the IP address of Your mobile device,
							Your mobile operating system, the type of mobile
							Internet browser You use, unique device identifiers
							and other diagnostic data.
						</p>
						<p>
							We may also collect information that Your browser
							sends whenever You visit our Service or when You
							access the Service by or through a mobile device.
						</p>
						<h4>Information About Others</h4>
						<p>
							When registering or claiming a car, You may submit
							information that relates to prior owners or other
							people connected to that vehicle, such as a name or
							general location. Submissions are reviewed by
							moderators before information is added to the public
							registry. If You believe someone has submitted
							information about You and would like it corrected or
							removed, please contact Us.
						</p>
						<h4>Cookies</h4>
						<p>
							We do not use analytics services, advertising
							trackers, or web beacons. The only cookies used by
							the Service are essential authentication cookies set
							by Our authentication provider, Clerk, to keep You
							signed in and to prevent fraudulent use of Your
							account. Without these cookies, signed-in features
							of the Service cannot be provided.
						</p>
						<p>
							Third-party content embedded in the Service, such as
							Google Maps, may set its own cookies, which are
							governed by those providers' privacy policies.
						</p>
						<h3>Use of Your Personal Data</h3>
						<p>
							We may use Personal Data for the following purposes:
						</p>
						<ul>
							<li>
								<p>
									<strong>
										To provide and maintain our Service
									</strong>
									, including to monitor the usage of our
									Service.
								</p>
							</li>
							<li>
								<p>
									<strong>To manage Your Account:</strong> to
									manage Your registration as a user of the
									Service. The Personal Data You provide can
									give You access to different functionalities
									of the Service that are available to You as
									a registered user.
								</p>
							</li>
							<li>
								<p>
									<strong>To contact You:</strong> To contact
									You by email regarding updates or
									informative communications related to the
									Service, including security updates, when
									necessary or reasonable for their
									implementation.
								</p>
							</li>
							<li>
								<p>
									<strong>To provide You</strong> with news
									and general information about the Service,
									the registry, and related community events,
									unless You have opted not to receive such
									information.
								</p>
							</li>
							<li>
								<p>
									<strong>To manage Your requests:</strong> To
									attend and manage Your requests to Us.
								</p>
							</li>
							<li>
								<p>
									<strong>For business transfers:</strong> We
									may use Your information to evaluate or
									conduct a merger, divestiture,
									restructuring, reorganization, dissolution,
									or other sale or transfer of some or all of
									Our assets, whether as a going concern or as
									part of bankruptcy, liquidation, or similar
									proceeding, in which Personal Data held by
									Us about our Service users is among the
									assets transferred.
								</p>
							</li>
							<li>
								<p>
									<strong>For other purposes</strong>: We may
									use Your information for other purposes,
									such as data analysis, identifying usage
									trends, and evaluating and improving our
									Service and your experience.
								</p>
							</li>
						</ul>
						<p>
							We may share Your personal information in the
							following situations:
						</p>
						<ul>
							<li>
								<strong>With Service Providers:</strong> We may
								share Your personal information with Service
								Providers to operate the Service and to contact
								You. The Service Providers We currently use are
								Clerk (authentication and account management),
								Resend (email delivery), Cloudflare (hosting,
								database, and image storage), Google (maps,
								location autocomplete, and fonts), Font Awesome
								(icons), and the Internet Archive (public
								dataset archival, described below). When You
								look up a VIN, Your browser also sends that VIN
								directly to the U.S. National Highway Traffic
								Safety Administration's vehicle database.
							</li>
							<li>
								<strong>For business transfers:</strong> We may
								share or transfer Your personal information in
								connection with, or during negotiations of, any
								merger, sale of Our assets, financing, or
								acquisition of all or a portion of Our business
								to another company.
							</li>
							<li>
								<strong>With other users:</strong> the registry
								is public. When Your car is added to the
								registry, Your name, general location (city,
								state or province, and country), ownership
								history, and any social media links You choose
								to share are displayed publicly on the Service
								and included in Our public dataset.
							</li>
							<li>
								<strong>With Your consent</strong>: We may
								disclose Your personal information for any other
								purpose with Your consent.
							</li>
						</ul>
						<h3>Open Data and the Internet Archive</h3>
						<p>
							The registry is, by design, a public dataset.
							Information displayed publicly on the Service —
							including car details, VINs, ownership history,
							owner names, general locations, and social media
							links — is also published as an open dataset under
							the AGPL-3.0 license.
						</p>
						<p>
							Once a week, We export the registry data and upload
							it to the Internet Archive (archive.org), where it
							is publicly downloadable. This export contains only
							data that is already publicly visible on the
							Service; it does not include email addresses,
							account credentials, or submissions awaiting
							moderation. Because the Internet Archive is an
							independent organization whose archives are designed
							to be permanent, We cannot modify or delete copies
							of the dataset that have already been archived.
						</p>
						<h3>Retention of Your Personal Data</h3>
						<p>
							We will retain Your Personal Data only for as long
							as is necessary for the purposes set out in this
							Privacy Policy. We will retain and use Your Personal
							Data to the extent necessary to comply with our
							legal obligations (for example, if we are required
							to retain your data to comply with applicable laws),
							resolve disputes, and enforce our legal agreements
							and policies.
						</p>
						<p>
							We will also retain Usage Data for internal analysis
							purposes. Usage Data is generally retained for a
							shorter period of time, except when this data is
							used to strengthen the security or to improve the
							functionality of Our Service, or We are legally
							obligated to retain this data for longer time
							periods.
						</p>
						<p>
							Data included in Our public dataset may persist
							indefinitely in third-party archives, as described
							in the Open Data section above.
						</p>
						<h3>Transfer of Your Personal Data</h3>
						<p>
							Your information, including Personal Data, is
							processed at Our operating offices and in any other
							places where the parties involved in the processing
							are located. It means that this information may be
							transferred to — and maintained on — computers
							located outside of Your state, province, country or
							other governmental jurisdiction where the data
							protection laws may differ than those from Your
							jurisdiction.
						</p>
						<p>
							Your consent to this Privacy Policy followed by Your
							submission of such information represents Your
							agreement to that transfer.
						</p>
						<p>
							We will take all steps reasonably necessary to
							ensure that Your data is treated securely and in
							accordance with this Privacy Policy and no transfer
							of Your Personal Data will take place to an
							organization or a country unless there are adequate
							controls in place including the security of Your
							data and other personal information.
						</p>
						<h3>Delete Your Personal Data</h3>
						<p>
							You may update Your account information, general
							location, and social media links at any time through
							the account settings section of the Service, and You
							may delete Your Account entirely from the same
							place.
						</p>
						<p>
							Because the registry is a historical record,
							deleting Your Account does not remove registry
							records such as Your name, general location, and
							ownership history from car pages; these remain part
							of the public registry. If You would like this
							information corrected, anonymized, or removed,
							please contact Us and We will make reasonable
							efforts to accommodate Your request.
						</p>
						<p>
							Please note that We cannot remove data from copies
							of Our public dataset already archived by third
							parties such as the Internet Archive, and that We
							may need to retain certain information when We have
							a legal obligation or lawful basis to do so.
						</p>
						<h3>Disclosure of Your Personal Data</h3>
						<h4>Business Transactions</h4>
						<p>
							If We are involved in a merger, acquisition or asset
							sale, Your Personal Data may be transferred. We will
							provide notice before Your Personal Data is
							transferred and becomes subject to a different
							Privacy Policy.
						</p>
						<h4>Law enforcement</h4>
						<p>
							Under certain circumstances, We may be required to
							disclose Your Personal Data if required to do so by
							law or in response to valid requests by public
							authorities (e.g. a court or a government agency).
						</p>
						<h4>Other legal requirements</h4>
						<p>
							We may disclose Your Personal Data in the good faith
							belief that such action is necessary to:
						</p>
						<ul>
							<li>Comply with a legal obligation</li>
							<li>Protect and defend Our rights or property</li>
							<li>
								Prevent or investigate possible wrongdoing in
								connection with the Service
							</li>
							<li>
								Protect the personal safety of Users of the
								Service or the public
							</li>
							<li>Protect against legal liability</li>
						</ul>
						<h3>Security of Your Personal Data</h3>
						<p>
							The security of Your Personal Data is important to
							Us, but remember that no method of transmission over
							the Internet, or method of electronic storage is
							100% secure. While We strive to use commercially
							acceptable means to protect Your Personal Data, We
							cannot guarantee its absolute security.
						</p>
						<h2>Children's Privacy</h2>
						<p>
							Our Service does not address anyone under the age of
							13. We do not knowingly collect personally
							identifiable information from anyone under the age
							of 13. If You are a parent or guardian and You are
							aware that Your child has provided Us with Personal
							Data, please contact Us. If We become aware that We
							have collected Personal Data from anyone under the
							age of 13 without verification of parental consent,
							We take steps to remove that information from Our
							servers.
						</p>
						<p>
							If We need to rely on consent as a legal basis for
							processing Your information and Your country
							requires consent from a parent, We may require Your
							parent's consent before We collect and use that
							information.
						</p>
						<h2>Links to Other Websites</h2>
						<p>
							Our Service may contain links to other websites that
							are not operated by Us. If You click on a third
							party link, You will be directed to that third
							party's site. We strongly advise You to review the
							Privacy Policy of every site You visit.
						</p>
						<p>
							We have no control over and assume no responsibility
							for the content, privacy policies or practices of
							any third party sites or services.
						</p>
						<h2>Changes to this Privacy Policy</h2>
						<p>
							We may update Our Privacy Policy from time to time.
							We will notify You of any changes by posting the new
							Privacy Policy on this page.
						</p>
						<p>
							When We make changes, We will update the &quot;Last
							updated&quot; date at the top of this Privacy
							Policy.
						</p>
						<p>
							You are advised to review this Privacy Policy
							periodically for any changes. Changes to this
							Privacy Policy are effective when they are posted on
							this page.
						</p>
						<h2>Contact Us</h2>
						<p>
							If you have any questions about this Privacy Policy,
							You can contact us:
						</p>
						<ul>
							<li>
								By visiting this page on our website:{' '}
								<a
									href="https://miataregistry.com/about#contact"
									rel="external nofollow noopener"
									target="_blank"
								>
									https://miataregistry.com/about#contact
								</a>
							</li>
						</ul>
					</section>
				</div>
			</div>
		</main>
	);
};
