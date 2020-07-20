/**
 * WordPress dependencies
 */
import { RichText, InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { defaultColumnsNumber } from './shared';

export default function save( { attributes } ) {
	const {
		images,
		columns = defaultColumnsNumber( attributes ),
		imageCrop,
		caption,
		linkTo,
	} = attributes;

	return (
		<figure
			className={ `columns-${ columns } ${
				imageCrop ? 'is-cropped' : ''
			}` }
		>
			<InnerBlocks.Content />

			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content
					tagName="figcaption"
					className="blocks-gallery-caption"
					value={ caption }
				/>
			) }
		</figure>
	);
}
